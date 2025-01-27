import { ClientResponse, CompanyResponse, InternalUsers } from '@/types/common'
import { CreateTaskRequest, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { getFilePathFromUrl, replaceImageSrc } from '@/utils/signedUrlReplacer'
import { getSignedUrl } from '@/utils/signUrl'
import { SupabaseActions } from '@/utils/SupabaseActions'
import APIError from '@api/core/exceptions/api'
import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { UserAction, UserRole } from '@api/core/types/user'
import { LabelMappingService } from '@api/label-mapping/label-mapping.service'
import { TaskNotificationsService } from '@api/tasks/task-notifications.service'
import { getArchivedStatus, getTaskTimestamps } from '@api/tasks/tasks.helpers'
import { TasksActivityLogger } from '@api/tasks/tasks.logger'
import { AssigneeType, StateType, Task, WorkflowState } from '@prisma/client'
import httpStatus from 'http-status'
import { z } from 'zod'

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

    // Default filters
    let filters = {
      where: {
        id,
        workspaceId: user.workspaceId,
        OR: undefined as FilterByAssigneeId[] | undefined,
      },
    }

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

  async getAllTasks(queryFilters?: { showArchived: boolean; showUnarchived: boolean; showIncompleteOnly?: boolean }) {
    // Check if given user role is authorized access to this resource
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.Tasks)

    // Build query filters based on role of user. IU can access all tasks related to a workspace
    // while clients can only view the tasks assigned to them or their company
    const filters = this.buildReadFilters()

    let isArchived: boolean | undefined = false
    // Archived tasks are only accessible to IU
    if (queryFilters) {
      // If both archived filters are explicitly 0 / falsey for IU, shortcircuit and return empty array
      if (!queryFilters.showArchived && !queryFilters.showUnarchived) {
        return []
      }

      isArchived = getArchivedStatus(queryFilters.showArchived, queryFilters.showUnarchived)
    }

    if (queryFilters?.showIncompleteOnly) {
      // @ts-expect-error Injecting a valid workflowState query here
      filters.where.workflowState = {
        type: { not: StateType.completed },
      }
    }

    let tasks = await this.db.task.findMany({
      where: {
        ...filters.where,
        isArchived,
      },
      orderBy: [
        {
          dueDate: { sort: 'asc', nulls: 'last' },
        },
        {
          createdAt: 'desc',
        },
      ],
      relationLoadStrategy: 'join',
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
      console.log('testloghere', taskClient, taskClient?.companyId)
      const taskClientsCompanyId = z.string().parse(taskClient?.companyId)
      console.log('testloghere2', taskClientsCompanyId)
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
      const activityLogger = new TasksActivityLogger(this.user, newTask)
      await activityLogger.logNewTask()

      if (newTask.body) {
        const newBody = await this.updateTaskIdOfAttachmentsAfterCreation(newTask.body, newTask.id)
        await this.db.task.update({
          where: { id: newTask.id },
          data: {
            body: newBody,
          },
        })
      }
    }

    const taskNotificationsSevice = new TaskNotificationsService(this.user)
    await taskNotificationsSevice.sendTaskCreateNotifications(newTask)
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
      relationLoadStrategy: 'join',
      include: {
        workflowState: true,
      },
    })
    if (!task) throw new APIError(httpStatus.NOT_FOUND, 'The requested task was not found')
    const updatedTask = await this.db.task.update({
      where: { id: task.id },
      data: {
        body: task.body && (await replaceImageSrc(task.body, getSignedUrl)),
      },
    })

    return updatedTask
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
      relationLoadStrategy: 'join',
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

    // Set / reset lastArchivedDate if isArchived has been triggered, else remove it from the update query
    const lastArchivedDate = data.isArchived === true ? new Date() : data.isArchived === false ? null : undefined

    // Get the updated task
    const updatedTask = await this.db.task.update({
      where: { id },
      data: {
        ...data,
        assigneeId: data.assigneeId === '' ? null : data.assigneeId,
        label,
        lastArchivedDate,
        ...(await getTaskTimestamps('update', this.user, data, prevTask)),
      },
      include: { workflowState: true },
    })

    if (updatedTask) {
      const activityLogger = new TasksActivityLogger(this.user, updatedTask)
      await activityLogger.logTaskUpdated(prevTask)
    }

    const taskNotificationsSevice = new TaskNotificationsService(this.user)
    await taskNotificationsSevice.sendTaskUpdateNotifications(prevTask, updatedTask)

    return updatedTask
  }

  async deleteOneTask(id: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Delete, Resource.Tasks)

    // Try to delete existing client notification related to this task if exists
    const task = await this.db.task.findFirst({
      where: { id },
      relationLoadStrategy: 'join',
      include: { workflowState: true },
    })

    if (!task) throw new APIError(httpStatus.NOT_FOUND, 'The requested task to delete was not found')

    const taskNotificationsSevice = new TaskNotificationsService(this.user)
    await taskNotificationsSevice.removeDeletedTaskNotifications(task)

    //delete the associated label
    const labelMappingService = new LabelMappingService(this.user)
    await labelMappingService.deleteLabel(task?.label)

    await this.db.task.delete({ where: { id } })
    // Logic to remove internal user notifications when a task is deleted / assignee is deleted
    // ...In case requirements change later again
    // const notificationService = new NotificationService(this.user)
    // await notificationService.deleteInternalUserNotificationForTask(id)
  }

  private async updateTaskIdOfAttachmentsAfterCreation(htmlString: string, task_id: string) {
    const imgTagRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/g //expression used to match all img srcs in provided HTML string.
    const attachmentTagRegex = /<\s*[a-zA-Z]+\s+[^>]*data-type="attachment"[^>]*src="([^"]+)"[^>]*>/g //expression used to match all attachment srcs in provided HTML string.
    let match
    const replacements: { originalSrc: string; newUrl: string }[] = []

    const newFilePaths: { originalSrc: string; newFilePath: string }[] = []
    const copyAttachmentPromises: Promise<void>[] = []
    const matches: { originalSrc: string; filePath: string; fileName: string }[] = []

    while ((match = imgTagRegex.exec(htmlString)) !== null) {
      const originalSrc = match[1]
      const filePath = getFilePathFromUrl(originalSrc)
      const fileName = filePath?.split('/').pop()
      if (filePath && fileName) {
        matches.push({ originalSrc, filePath, fileName })
      }
    }

    while ((match = attachmentTagRegex.exec(htmlString)) !== null) {
      const originalSrc = match[1]
      const filePath = getFilePathFromUrl(originalSrc)
      const fileName = filePath?.split('/').pop()
      if (filePath && fileName) {
        matches.push({ originalSrc, filePath, fileName })
      }
    }

    for (const { originalSrc, filePath, fileName } of matches) {
      const newFilePath = `${this.user.workspaceId}/${task_id}/${fileName}`
      const supabaseActions = new SupabaseActions()
      copyAttachmentPromises.push(supabaseActions.moveAttachment(filePath, newFilePath))
      newFilePaths.push({ originalSrc, newFilePath })
    }

    await Promise.all(copyAttachmentPromises)

    const signedUrlPromises = newFilePaths.map(async ({ originalSrc, newFilePath }) => {
      const newUrl = await getSignedUrl(newFilePath)
      if (newUrl) {
        replacements.push({ originalSrc, newUrl })
      }
    })

    await Promise.all(signedUrlPromises)

    for (const { originalSrc, newUrl } of replacements) {
      htmlString = htmlString.replace(originalSrc, newUrl)
    }
    const filePaths = newFilePaths.map(({ newFilePath }) => newFilePath)
    await this.db.scrapMedia.updateMany({
      where: {
        filePath: {
          in: filePaths,
        },
      },
      data: {
        taskId: task_id,
      },
    })
    return htmlString
  }

  async setNewLastActivityLogUpdated(taskId: string) {
    await this.db.task.update({
      where: { id: taskId },
      data: { lastActivityLogUpdated: new Date() },
    })
  }

  async getIncompleteTasksForCompany(assigneeId: string): Promise<(Task & { workflowState: WorkflowState })[]> {
    // This works across workspaces
    return await this.db.task.findMany({
      where: {
        assigneeId,
        assigneeType: AssigneeType.company,
        workflowState: { type: { not: StateType.completed } },
        isArchived: false,
      },
      relationLoadStrategy: 'join',
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
    return tasks
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
      relationLoadStrategy: 'join',
      include: { workflowState: true },
    })
    if (!prevTask) throw new APIError(httpStatus.NOT_FOUND, 'The requested task was not found')

    //get Completed or custom workflowState data
    const updatedWorkflowState = await this.db.workflowState.findFirst({
      where: {
        id: targetWorkflowStateId ? targetWorkflowStateId : undefined,
        type: targetWorkflowStateId ? undefined : StateType.completed,
        workspaceId: this.user.workspaceId,
      },
    })
    const data = { workflowStateId: updatedWorkflowState?.id }
    // Get the updated task
    const updatedTask = await this.db.task.update({
      where: { id },
      data: {
        ...data,
        ...(await getTaskTimestamps('update', this.user, data, prevTask)),
      },
      include: { workflowState: true },
    })

    if (updatedTask) {
      const activityLogger = new TasksActivityLogger(this.user, updatedTask)
      await activityLogger.logTaskUpdated(prevTask)
    }

    const taskNotificationsSevice = new TaskNotificationsService(this.user)
    await taskNotificationsSevice.sendClientUpdateTaskNotifications(prevTask, updatedTask, updatedWorkflowState)
    return updatedTask
  }
}
