import { CreateTaskRequest, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { BaseService } from '@api/core/services/base.service'
import { Resource } from '@api/core/types/api'
import { PoliciesService } from '@api/core/services/policies.service'
import { ActivityType, StateType, AssigneeType, Task, WorkflowState } from '@prisma/client'
import { UserAction, UserRole } from '@api/core/types/user'
import { NotificationTaskActions } from '@api/core/types/tasks'
import { getTaskTimestamps } from '@api/tasks/tasks.helpers'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'
import { ActivityLogger } from '@api/activity-logs/services/activity-logger.service'
import { TaskCreatedSchema } from '@api/activity-logs/schemas/TaskCreatedSchema'
import { TaskAssignedSchema } from '@api/activity-logs/schemas/TaskAssignedSchema'
import { WorkflowStateUpdatedSchema } from '@api/activity-logs/schemas/WorkflowStateUpdatedSchema'
import { NotificationService } from '@api/notification/notification.service'
import { LabelMappingService } from '@api/label-mapping/label-mapping.service'
import { z } from 'zod'
import { ClientResponse, CompanyResponse, InternalUsers, NotificationCreatedResponseSchema } from '@/types/common'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { replaceImageSrc } from '@/utils/imageReplacer'
import { SupabaseService } from '../core/services/supabase.service'
import { supabaseBucket } from '@/config'
import { AttachmentsService } from '../attachments/attachments.service'

type FilterByAssigneeId = {
  assigneeId: string
  assigneeType: AssigneeType
}

export class TasksService extends BaseService {
  /**
   * Builds filter for "get" service methods.
   * If user is an IU, return filter for all tasks associated with this workspace
   * If user is a client, return filter for just the tasks assigned to this clientId.
   * If user is a client and has a companyId, return filter for just the tasks assigned to this clientId `OR` to this companyId
   */
  private buildReadFilters(id?: string) {
    const user = this.user

    let filters = { where: { id, workspaceId: user.workspaceId, OR: undefined as unknown as FilterByAssigneeId[] } }

    if (user.clientId) {
      filters = {
        where: {
          ...filters.where,
          OR: [{ assigneeId: user.clientId as string, assigneeType: 'client' }],
        },
      }
    }
    if (user.clientId && user.companyId) {
      filters = {
        where: {
          ...filters.where,
          OR: [
            { assigneeId: user.clientId as string, assigneeType: 'client' },
            { assigneeId: user.companyId, assigneeType: 'company' },
          ],
        },
      }
    }

    return filters
  }

  async getAllTasks() {
    // Check if given user role is authorized access to this resource
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.Tasks)

    // Build query filters based on role of user. IU can access all tasks related to a workspace
    // while clients can only view the tasks assigned to them or their company
    const filters = this.buildReadFilters()

    let tasks = await this.db.task.findMany({
      ...filters,
      orderBy: { createdAt: 'desc' },
      include: {
        workflowState: { select: { name: true } },
      },
    })

    if (!this.user.internalUserId) {
      return tasks
    }

    // Now we have the challenge of figuring out if a task is assigned to a client / company that falls in IU's access list
    const copilot = new CopilotAPI(this.user.token)
    const currentInternalUser = await copilot.getInternalUser(this.user.internalUserId)
    if (!currentInternalUser.isClientAccessLimited) return tasks

    const hasClientTasks = tasks.some((task) => task.assigneeType === AssigneeType.client)
    const clients = hasClientTasks ? await copilot.getClients() : { data: [] }

    return tasks.filter((task) => {
      // Allow IU to access unassigned tasks or tasks assigned to another IU within workspace
      if (!task.assigneeId || task.assigneeType === AssigneeType.internalUser) return true

      // TODO: Refactor this hacky abomination of code as soon as copilot API natively supports access scopes
      // Filter out only tasks that belong to a client that has companyId in IU's companyAccessList
      if (task.assigneeType === AssigneeType.company) {
        return currentInternalUser.companyAccessList?.includes(task.assigneeId)
      }
      const taskClient = clients.data?.find((client) => client.id === task.assigneeId)
      const taskClientsCompanyId = z.string().parse(taskClient?.companyId)
      return currentInternalUser.companyAccessList?.includes(taskClientsCompanyId)
    })
  }

  async createTask(data: CreateTaskRequest) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.Tasks)

    //generate the label
    const labelMappingService = new LabelMappingService(this.user)
    const label = z.string().parse(await labelMappingService.getLabel(data.assigneeId, data.assigneeType))

    // Create a new task associated with current workspaceId. Also inject current request user as the creator.
    const newTask = await this.db.task.create({
      data: {
        ...data,
        workspaceId: this.user.workspaceId,
        createdById: this.user.internalUserId as string,
        label: label,
        ...(await getTaskTimestamps('create', this.user, data)),
      },
      include: { workflowState: true },
    })

    if (newTask) {
      // @todo move this logic to any pub/sub service like event bus
      const activityLogger = new ActivityLogger({ taskId: newTask.id, user: this.user })
      await activityLogger.log(
        ActivityType.TASK_CREATED,
        TaskCreatedSchema.parse({
          id: newTask.id,
          workspaceId: newTask.workspaceId,
          assigneeId: newTask.assigneeId,
          assigneeType: newTask.assigneeType,
          title: newTask.title,
          body: newTask.body,
          dueData: newTask.dueDate,
        }),
      )
    }

    await this.sendTaskCreateNotifications(newTask)
    return newTask
  }

  async getOneTask(id: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.Tasks)

    // Build query filters based on role of user. IU can access all tasks related to a workspace
    // while clients can only view the tasks assigned to them or their company
    const filters = this.buildReadFilters(id)

    const task = await this.db.task.findFirst({
      ...filters,
      include: {
        workflowState: true,
      },
    })
    if (!task) throw new APIError(httpStatus.NOT_FOUND, 'The requested task was not found')

    task.body = task.body && (await replaceImageSrc(task.body, this.getSignedUrl))
    console.log('prefetching replacements')
    return task
  }

  async getTaskAssignee(task: Task): Promise<InternalUsers | ClientResponse | CompanyResponse | undefined> {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.Tasks)
    if (!task.assigneeId || !task.assigneeType) return undefined

    const copilot = new CopilotAPI(this.user.token)
    switch (task.assigneeType) {
      case AssigneeType.internalUser:
        return await copilot.getInternalUser(task.assigneeId)
      case AssigneeType.client:
        return await copilot.getClient(task.assigneeId)
      default:
        return await copilot.getCompany(task.assigneeId)
    }
  }

  async updateOneTask(id: string, data: UpdateTaskRequest) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Update, Resource.Tasks)

    // Query previous task
    const filters = this.buildReadFilters(id)
    const prevTask = await this.db.task.findFirst({
      ...filters,
      include: { workflowState: true },
    })
    if (!prevTask) throw new APIError(httpStatus.NOT_FOUND, 'The requested task was not found')

    let label: string = prevTask.label
    //generate new label if prevTask has no assignee but now assigned to someone
    if (!prevTask.assigneeId && data.assigneeId) {
      const labelMappingService = new LabelMappingService(this.user)
      //delete the existing label
      await labelMappingService.deleteLabel(prevTask.label)
      label = z.string().parse(await labelMappingService.getLabel(data.assigneeId, data.assigneeType))
    }
    // Get the updated task
    const updatedTask = await this.db.task.update({
      where: { id },
      data: {
        ...data,
        assigneeId: data.assigneeId === '' ? null : data.assigneeId,
        label,
        ...(await getTaskTimestamps('update', this.user, data, prevTask)),
      },
      include: { workflowState: true },
    })

    if (updatedTask) {
      const activityLogger = new ActivityLogger({ taskId: updatedTask.id, user: this.user })

      if (updatedTask.assigneeId !== prevTask.assigneeId) {
        await activityLogger.log(
          ActivityType.TASK_ASSIGNED,
          TaskAssignedSchema.parse({
            oldAssigneeId: prevTask.assigneeId,
            newAssigneeId: updatedTask.assigneeId,
            assigneeType: updatedTask.assigneeType,
          }),
        )
      }

      if (updatedTask.workflowStateId !== prevTask?.workflowStateId) {
        const prevWorkflowState = prevTask.workflowState
        const currentWorkflowState = updatedTask.workflowState

        await activityLogger.log(
          ActivityType.WORKFLOW_STATE_UPDATED,
          WorkflowStateUpdatedSchema.parse({
            oldWorkflowState: {
              id: prevWorkflowState.id,
              type: prevWorkflowState.type,
              name: prevWorkflowState.name,
              key: prevWorkflowState.key,
              color: prevWorkflowState.color,
            },
            newWorkflowState: {
              id: currentWorkflowState.id,
              type: currentWorkflowState.type,
              name: currentWorkflowState.name,
              key: currentWorkflowState.key,
              color: currentWorkflowState.color,
            },
          }),
        )
      }
    }

    await this.sendTaskUpdateNotifications(prevTask, updatedTask)

    return updatedTask
  }

  async deleteOneTask(id: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Delete, Resource.Tasks)

    // Try to delete existing client notification related to this task if exists
    const task = await this.db.task.findFirst({ where: { id }, include: { workflowState: true } })

    if (!task) throw new APIError(httpStatus.NOT_FOUND, 'The requested task to delete was not found')

    const notificationsService = new NotificationService(this.user)
    if (task?.assigneeType && task.workflowState.type !== NotificationTaskActions.Completed) {
      const handleNotificationRead = {
        [AssigneeType.client]: notificationsService.markClientNotificationAsRead,
        [AssigneeType.company]: notificationsService.markAsReadForAllRecipients,
      }
      // @ts-expect-error This is completely safe
      await handleNotificationRead[task?.assigneeType]?.(task)
    }
    //delete the associated label
    const labelMappingService = new LabelMappingService(this.user)
    await labelMappingService.deleteLabel(task?.label)

    await this.db.task.delete({ where: { id } })
    const notificationService = new NotificationService(this.user)
    await notificationService.deleteInternalUserNotificationForTask(id)
    await this.db.internalUserNotification.deleteMany({ where: { taskId: id } })
  }

  async getIncompleteTasksForCompany(assigneeId: string): Promise<(Task & { workflowState: WorkflowState })[]> {
    // This works across workspaces
    return await this.db.task.findMany({
      where: { assigneeId, assigneeType: AssigneeType.company, workflowState: { type: { not: StateType.completed } } },
      include: { workflowState: true },
    })
  }

  async deleteAllAssigneeTasks(assigneeId: string, assigneeType: AssigneeType) {
    // Policies validation shouldn't be required here because token is from a webhook event
    const tasks = await this.db.task.findMany({
      where: { assigneeId, assigneeType, workspaceId: this.user.workspaceId },
    })
    if (!tasks.length) {
      // If assignee doesn't have an associated task at all, skip logic
      return []
    }
    const labels = tasks.map((task) => task.label)

    await this.db.task.deleteMany({
      where: { assigneeId, assigneeType, workspaceId: this.user.workspaceId },
    })
    await this.db.label.deleteMany({ where: { label: { in: labels } } })
  }

  async clientUpdateTask(id: string, targetWorkflowStateId?: string | null) {
    //Apply custom authorization here. Policy service is not used because this api is for client's Mark done function only. Only clients can use this.
    if (this.user.role === UserRole.IU) {
      throw new APIError(httpStatus.UNAUTHORIZED, 'You are not authorized to perform this action')
    }

    // Query previous task
    const filters = this.buildReadFilters(id)
    const prevTask = await this.db.task.findFirst({
      ...filters,
      include: { workflowState: true },
    })
    if (!prevTask) throw new APIError(httpStatus.NOT_FOUND, 'The requested task was not found')

    //get Completed or custom workflowState data
    const updatedWorkflowState = targetWorkflowStateId
      ? await this.db.workflowState.findFirst({
          where: {
            id: targetWorkflowStateId,
            workspaceId: this.user.workspaceId,
          },
        })
      : await this.db.workflowState.findFirst({
          where: {
            type: StateType.completed,
            workspaceId: this.user.workspaceId,
          },
        })
    const data = {
      workflowStateId: updatedWorkflowState?.id,
    }
    // Get the updated task
    const updatedTask = await this.db.task.update({
      where: { id },
      data: {
        ...data,
        ...(await getTaskTimestamps('update', this.user, data, prevTask)),
      },
    })

    // --------------------------
    // --- Notifications Logic
    // --------------------------
    const notificationService = new NotificationService(this.user)

    // If task has been moved back to another non-completed state from Completed
    if (
      updatedWorkflowState &&
      updatedWorkflowState.type !== StateType.completed &&
      prevTask.workflowState.type === StateType.completed
    ) {
      // We need to trigger the notification count for client again!
      await this.sendTaskCreateNotifications({ ...updatedTask, workflowState: updatedWorkflowState })
    }

    // If task has been moved to completed from a non-complete state, remove all notification counts
    if (updatedWorkflowState?.type === StateType.completed && prevTask.workflowState.type !== StateType.completed) {
      if (updatedTask.assigneeType === AssigneeType.company) {
        const copilot = new CopilotAPI(this.user.token)
        const { recipientIds } = await notificationService.getNotificationParties(
          copilot,
          updatedTask,
          NotificationTaskActions.CompletedByCompanyMember,
        )
        await notificationService.createBulkNotification(
          NotificationTaskActions.CompletedByCompanyMember,
          updatedTask,
          recipientIds,
        )
        await notificationService.markAsReadForAllRecipients(updatedTask)
      } else {
        await notificationService.create(NotificationTaskActions.Completed, updatedTask)
        await notificationService.markClientNotificationAsRead(updatedTask)
      }
    }
    return updatedTask
  }

  private async sendUserTaskNotification(task: Task, notificationService: NotificationService, isReassigned = false) {
    const notification = await notificationService.create(
      //! In future when reassignment is supported, change this logic to support reassigned to client as well
      isReassigned ? NotificationTaskActions.ReassignedToIU : NotificationTaskActions.Assigned,
      task,
      {
        email: task.assigneeType === AssigneeType.internalUser,
      },
    )
    // Create a new entry in ClientNotifications table so we can mark as read on
    // behalf of client later
    if (!notification) {
      console.error('Notification failed to trigger for task:', task)
    }
    if (task.assigneeType === AssigneeType.client) {
      await notificationService.addToClientNotifications(task, NotificationCreatedResponseSchema.parse(notification))
    }
  }

  private sendCompanyTaskNotifications = async (
    task: Task,
    notificationService: NotificationService,
    isReassigned = false,
  ) => {
    const copilot = new CopilotAPI(this.user.token)
    const { recipientIds } = await notificationService.getNotificationParties(
      copilot,
      task,
      NotificationTaskActions.AssignedToCompany,
    )
    const notifications = await notificationService.createBulkNotification(
      NotificationTaskActions.AssignedToCompany,
      task,
      recipientIds,
      { email: true },
    )

    // This is a hacky way to bulk create ClientNotifications for all company members.
    if (notifications) {
      const notificationPromises = []
      for (let i = 0; i < notifications.length; i++) {
        // Basically we are treating an individual company member as a client recipient for a notification
        // For each loop we are considering a separate task where that particular member is the assignee
        notificationPromises.push(
          notificationService.addToClientNotifications(
            { ...task, assigneeId: recipientIds[0], assigneeType: AssigneeType.client },
            notifications[i],
          ),
        )
      }
      await Promise.all(notificationPromises)
    }
  }

  async sendTaskCreateNotifications(task: Task & { workflowState: WorkflowState }, isReassigned = false) {
    // If task is unassigned, there's nobody to send notifications to
    if (!task.assigneeId) return

    // If task is assigned to the same person that created it, no need to notify yourself
    if (task.assigneeId === task.createdById) return

    // If task is created as status completed for whatever reason, don't send a notification as well
    if (task.workflowState.type === NotificationTaskActions.Completed) return

    // If new task is assigned to someone (IU / Client / Company), send proper notification + email to them
    const notificationService = new NotificationService(this.user)
    const sendTaskNotifications =
      task.assigneeType === AssigneeType.company ? this.sendCompanyTaskNotifications : this.sendUserTaskNotification
    await sendTaskNotifications(task, notificationService, isReassigned)
  }

  private async sendTaskUpdateNotifications(
    prevTask: Task & { workflowState: WorkflowState },
    updatedTask: Task & { workflowState: WorkflowState },
  ) {
    if (prevTask.workflowStateId === updatedTask.workflowStateId) return

    const notificationService = new NotificationService(this.user)

    // --- Handle previous assignee notification "Mark as read" if it is updated
    if (prevTask.assigneeId != updatedTask.assigneeId && updatedTask.workflowState.type !== StateType.completed) {
      // If task is reassigned from a client, mark prev client notification as read
      if (prevTask.assigneeType === AssigneeType.client) {
        await notificationService.markClientNotificationAsRead(prevTask)
      }
      // If task is reassigned from a company, fetch all company members and mark all of those notifications read
      if (prevTask.assigneeType === AssigneeType.company) {
        await notificationService.markAsReadForAllRecipients(prevTask)
      }

      // If task reassigned from another user to self IU, don't send any notifications
      if (prevTask.assigneeId !== updatedTask.assigneeId && updatedTask.assigneeId === this.user.internalUserId) {
        return
      }

      // Handle new assignee notification creation
      // If task goes from unassigned to assigned, or from one assignee to another
      if (updatedTask.assigneeId) {
        const isReassigned =
          prevTask.assigneeId !== updatedTask.assigneeId && !!prevTask.assigneeId && !!updatedTask.assigneeId
        await this.sendTaskCreateNotifications(updatedTask, isReassigned)
      }
    }

    // --- Handle task moved to completed logic
    // If task was previous in another state, and is moved to a 'completed' type WorkflowState by IU
    if (
      prevTask?.workflowState?.type !== StateType.completed &&
      updatedTask?.workflowState?.type === StateType.completed &&
      updatedTask.assigneeId
    ) {
      if (updatedTask.createdById !== updatedTask.assigneeId) {
        // Make sure company task is not marked as complete by IU
        if (
          (updatedTask.assigneeType === AssigneeType.company || updatedTask.assigneeType === AssigneeType.internalUser) &&
          updatedTask.createdById !== this.user.internalUserId
        ) {
          const action =
            updatedTask.assigneeType === AssigneeType.company
              ? NotificationTaskActions.CompletedForCompanyByIU
              : NotificationTaskActions.CompletedByIU
          await notificationService.create(action, updatedTask, { email: true })
        }
      }

      if (updatedTask.assigneeType === AssigneeType.client) {
        try {
          await notificationService.markClientNotificationAsRead(updatedTask)
        } catch (e: unknown) {
          console.error(`Failed to find ClientNotification for task ${updatedTask.id}`, e)
        }
      }
    }

    if (
      prevTask.workflowState?.type === StateType.completed &&
      updatedTask.workflowState?.type !== StateType.completed &&
      updatedTask.assigneeId
    ) {
      // If IU decides to move a task back to an incomplete state, trigger client / company notifications
      await this.sendTaskCreateNotifications(updatedTask)
    }

    // --- Handle task moved to complete
    await notificationService.markAsReadForAllRecipients(updatedTask)
  }

  async getSignedUrl(filePath: string) {
    const supabase = new SupabaseService()
    const { data, error } = await supabase.supabase.storage.from(supabaseBucket).createSignedUrl(filePath, 60 * 60)
    if (error) {
      console.log(error)
      throw new APIError(httpStatus.BAD_REQUEST)
    }
    const url = data.signedUrl
    return url
  } // used to replace urls for images in task body
}
