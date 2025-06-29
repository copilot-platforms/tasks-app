import { NotificationCreatedResponseSchema } from '@/types/common'
import { TaskWithWorkflowState } from '@/types/db'
import { CopilotAPI } from '@/utils/CopilotAPI'
import User from '@api/core/models/User.model'
import { BaseService } from '@api/core/services/base.service'
import { NotificationTaskActions } from '@api/core/types/tasks'
import { NotificationService } from '@api/notification/notification.service'
import { AssigneeType, StateType, Task, WorkflowState } from '@prisma/client'

export class TaskNotificationsService extends BaseService {
  private notificationService: NotificationService
  constructor(user: User) {
    super({ user })
    this.notificationService = new NotificationService({ user })
  }

  async removeDeletedTaskNotifications(task: TaskWithWorkflowState) {
    if (task?.assigneeType && task.workflowState.type !== NotificationTaskActions.Completed) {
      const handleNotificationRead = {
        [AssigneeType.client]: this.notificationService.markClientNotificationAsRead,
        [AssigneeType.company]: this.notificationService.markAsReadForAllRecipients,
      }
      // @ts-expect-error This is completely safe
      await handleNotificationRead[task?.assigneeType]?.(task)
    }
  }

  private async checkParentAccessible(task: TaskWithWorkflowState): Promise<boolean> {
    if ((task.assigneeType === AssigneeType.client || task.assigneeType === AssigneeType.company) && task.parentId) {
      if (!task.assigneeId) return false

      const parentTask = await this.db.task.findFirst({
        where: { id: task.parentId, workspaceId: this.user.workspaceId },
        select: { assigneeId: true, assigneeType: true },
      })
      if (!parentTask) return false

      const copilot = new CopilotAPI(this.user.token)
      if (task.assigneeType === AssigneeType.client) {
        const client = await copilot.getClient(task.assigneeId)
        if (parentTask.assigneeId === client.id || parentTask.assigneeId === client.companyId) {
          return true
        }
      } else {
        const clients = await copilot.getClients()
        const companyClientIds =
          clients.data?.filter((client) => client.companyId === task.assigneeId).map((client) => client.id) || []
        if (companyClientIds.includes(parentTask.assigneeId || '__empty__')) {
          return true
        }
      }
    }
    return false
  }

  async sendTaskCreateNotifications(task: TaskWithWorkflowState, isReassigned = false) {
    // If task is unassigned, there's nobody to send notifications to
    if (!task.assigneeId) return

    // If task is assigned to the same person that created it, no need to notify yourself
    if (task.assigneeId === task.createdById) return

    // If task is created as status completed for whatever reason, don't send a notification as well
    if (task.workflowState.type === NotificationTaskActions.Completed) return

    // If task is a subtask for a client/company and isn't visible on task board (is disjoint)
    if (await this.checkParentAccessible(task)) return

    // If new task is assigned to someone (IU / Client / Company), send proper notification + email to them
    const sendTaskNotifications =
      task.assigneeType === AssigneeType.company ? this.sendCompanyTaskNotifications : this.sendUserTaskNotification
    await sendTaskNotifications(task, isReassigned)
  }

  async sendTaskUpdateNotifications(prevTask: TaskWithWorkflowState, updatedTask: TaskWithWorkflowState) {
    /*
     * Cases:
     * 1. Task is archived / unarchived
     * 2. Assignee ID is changed for incomplete task -> Mark as read for previous recipients and trigger new notifications for new assignee
     * 3. Assignee ID is changed for completed task -> If previous assinee was IU, delete in-product notifications for prev assignee
     * 4. Task was changed from incomplete to complete state -> delete all notifications for all users
     * 5. Task was changed from complete to incomplete state -> recreate those notifications
     */

    // Case 1
    // -- Handle archive status update.
    // -- If task is moved to archived -> Mark as read notifications
    // -- If task is moved to uarchived -> Add appropriate notification
    if (prevTask.isArchived !== updatedTask.isArchived) {
      await this.handleTaskArchiveToggle(prevTask, updatedTask)
    }

    // Return if not workflowState / assignee updated
    const isReassigned = updatedTask.assigneeId && prevTask.assigneeId !== updatedTask.assigneeId
    if (prevTask.workflowStateId === updatedTask.workflowStateId && !isReassigned) return

    // Case 2
    // -- Handle previous assignee notification "Mark as read" if it is updated
    if (prevTask.assigneeId !== updatedTask.assigneeId && updatedTask.workflowState.type !== StateType.completed) {
      await this.handleIncompleteTaskReassignment(prevTask, updatedTask)
    }

    // Case 3
    // -- Check if prev assignee was IU. If so, delete any and all past in-product notifications related to this task
    if (
      prevTask.assigneeId !== updatedTask.assigneeId &&
      updatedTask.workflowState.type === StateType.completed &&
      prevTask.assigneeType === AssigneeType.internalUser
    ) {
      await this.notificationService.deleteInternalUserNotificationsForTask(prevTask.id)
    }

    // Case 4
    // -- If task was previously in another state, and is moved to a 'completed' type WorkflowState by IU
    if (
      prevTask?.workflowState?.type !== StateType.completed &&
      updatedTask?.workflowState?.type === StateType.completed &&
      updatedTask.assigneeId
    ) {
      await this.handleTaskCompletionNotifications(prevTask, updatedTask)
    }

    // Case 5
    // -- Handle task moved from completed to incomplete IU logic
    const isSelfAssignedIU =
      updatedTask.assigneeType === AssigneeType.internalUser && updatedTask.assigneeId === this.user.internalUserId
    if (
      prevTask.workflowState?.type === StateType.completed &&
      updatedTask.workflowState?.type !== StateType.completed &&
      updatedTask.assigneeId &&
      !isSelfAssignedIU
    ) {
      // If IU decides to move a task back to an incomplete state, trigger client / company notifications
      // UNLESS they are moving back an IU task assigned to themselves
      await this.sendTaskCreateNotifications(updatedTask)
    }
  }

  async sendClientUpdateTaskNotifications(
    prevTask: TaskWithWorkflowState,
    updatedTask: TaskWithWorkflowState,
    updatedWorkflowState: WorkflowState | null,
  ) {
    // Cases:
    // 1. Task has been moved back to a non-complete state from completed for client task
    // 2. Task has been moved back to a non-complete state from completed for company task
    // 3. Task has been moved to complete state for client task
    // 4. Task has been moved to complete state for company task

    // Case 1 & 2 | If task has been moved back to another non-completed state from Completed
    if (
      updatedWorkflowState &&
      updatedWorkflowState.type !== StateType.completed &&
      prevTask.workflowState.type === StateType.completed
    ) {
      // We need to trigger the notification count for client again!
      await this.sendTaskCreateNotifications({ ...updatedTask, workflowState: updatedWorkflowState })
    }

    // Case 3 & 4 | If task has been moved to completed from a non-complete state, remove all notification counts
    if (updatedWorkflowState?.type === StateType.completed && prevTask.workflowState.type !== StateType.completed) {
      await this.handleTaskCompleted(updatedTask)
    }
  }

  private handleTaskCompletionNotifications = async (
    _prevTask: TaskWithWorkflowState,
    updatedTask: TaskWithWorkflowState,
  ) => {
    let shouldCreateNotification = true
    // Don't send task notifications if the IU created the task themselves
    if (updatedTask.createdById === this.user.internalUserId) {
      shouldCreateNotification = false
    }
    if (updatedTask.assigneeType === AssigneeType.internalUser) {
      shouldCreateNotification &&
        (await this.notificationService.create(NotificationTaskActions.CompletedByIU, updatedTask, { disableEmail: true }))
      // TODO: Clean code and handle notification center notification deletions here instead
    } else if (updatedTask.assigneeType === AssigneeType.company) {
      // Don't do this in parallel since this can cause rate-limits, each of them has their own bottlenecks for avoiding ratelimits
      shouldCreateNotification &&
        (await this.notificationService.create(NotificationTaskActions.CompletedForCompanyByIU, updatedTask, {
          disableEmail: true,
        }))
      await this.notificationService.markAsReadForAllRecipients(updatedTask)
    } else if (updatedTask.assigneeType === AssigneeType.client) {
      shouldCreateNotification &&
        (await this.notificationService.create(NotificationTaskActions.CompletedByIU, updatedTask, { disableEmail: true }))
      try {
        await this.notificationService.markClientNotificationAsRead(updatedTask)
        return
      } catch (e: unknown) {
        console.error(`Failed to find ClientNotification for task ${updatedTask.id}`, e)
      }
    }
  }

  private handleIncompleteTaskReassignment = async (prevTask: Task, updatedTask: TaskWithWorkflowState) => {
    // Handle case where parent task is reassigned to a client / company, so the disjoint tasks disappear in real time
    if (
      (updatedTask.assigneeType === AssigneeType.client || updatedTask.assigneeType === AssigneeType.company) &&
      !updatedTask.parentId
    ) {
      // Remove all notifications for previously disjointed child tasks
      const childTasks = await this.db.task.findMany({
        where: { parentId: updatedTask.id, workspaceId: this.user.workspaceId },
      })
      if (childTasks.length) {
        const clientNotificationsForChildren = await this.db.clientNotification.findMany({
          where: { taskId: { in: childTasks.map((task) => task.id) } },
          select: { id: true },
        })
        await this.notificationService.bulkMarkAsRead(clientNotificationsForChildren.map(({ id }) => id))
      }
    }
    // Step 1: Handle notifications removal from previous user
    if (prevTask.assigneeId && prevTask.assigneeType) {
      const assigneeType = prevTask.assigneeType
      // -- If task is reassigned from client, delete past in-product notification
      if (assigneeType === AssigneeType.internalUser) {
        await this.notificationService.deleteInternalUserNotificationsForTask(prevTask.id)
      }
      // -- If task is reassigned from a client, mark prev client notification as read (not delete)
      if (assigneeType === AssigneeType.client) {
        await this.notificationService.markClientNotificationAsRead(prevTask)
      }
      // -- If task is reassigned from a company, fetch all company members and mark all of those notifications read
      if (assigneeType === AssigneeType.company) {
        await this.notificationService.markAsReadForAllRecipients(prevTask)
      }
    }
    // Step 2: Handle new assignee notification creation
    if (!updatedTask.assigneeId) {
      return // No one to send notifications to if task is reassigned to "No assignee"
    }
    // -- If task reassigned to self IU, don't send any notifications
    if (updatedTask.assigneeId === this.user.internalUserId) {
      return // old notifications were removed but new one was not created
    }
    // -- If task goes from unassigned to assigned task is createed
    // -- If task goes from one assignee to next task is reassigned
    const isReassigned = !!prevTask.assigneeId
    await this.sendTaskCreateNotifications(updatedTask, isReassigned)
  }

  private handleTaskCompleted = async (updatedTask: Task) => {
    const copilot = new CopilotAPI(this.user.token)
    if (updatedTask.assigneeType === AssigneeType.company) {
      const { recipientIds } = await this.notificationService.getNotificationParties(
        copilot,
        updatedTask,
        NotificationTaskActions.CompletedByCompanyMember,
      )
      await this.notificationService.createBulkNotification(
        NotificationTaskActions.CompletedByCompanyMember,
        updatedTask,
        recipientIds,
      )
      await this.notificationService.markAsReadForAllRecipients(updatedTask)
    } else {
      // Get every IU with access to company first
      const { recipientIds } = await this.notificationService.getNotificationParties(
        copilot,
        updatedTask,
        NotificationTaskActions.CompletedByCompanyMember,
      )
      await this.notificationService.createBulkNotification(NotificationTaskActions.Completed, updatedTask, recipientIds)
      await this.notificationService.markClientNotificationAsRead(updatedTask)
    }
  }

  private sendUserTaskNotification = async (task: Task, isReassigned = false) => {
    if (!task.assigneeType) return

    const notificationType = (() => {
      if (!isReassigned) return NotificationTaskActions.Assigned

      const properCopy = {
        [AssigneeType.internalUser]: NotificationTaskActions.ReassignedToIU,
        [AssigneeType.client]: NotificationTaskActions.ReassignedToClient,
        [AssigneeType.company]: NotificationTaskActions.ReassignedToCompany,
      }
      return properCopy[task.assigneeType]
    })()

    const notification = await this.notificationService.create(
      // In future when reassignment is supported, change this logic to support reassigned to client as well
      notificationType,
      task,
      {
        disableEmail: task.assigneeType === AssigneeType.internalUser,
      },
    )
    // Create a new entry in ClientNotifications table so we can mark as read on
    // behalf of client later
    if (!notification) {
      console.error('Notification failed to trigger for task:', task)
    }
    if (task.assigneeType === AssigneeType.client) {
      await this.notificationService.addToClientNotifications(task, NotificationCreatedResponseSchema.parse(notification))
    }
  }

  private sendCompanyTaskNotifications = async (task: Task, isReassigned = false) => {
    const copilot = new CopilotAPI(this.user.token)
    const { recipientIds } = await this.notificationService.getNotificationParties(
      copilot,
      task,
      NotificationTaskActions.AssignedToCompany,
    )
    const notifications = await this.notificationService.createBulkNotification(
      isReassigned ? NotificationTaskActions.ReassignedToCompany : NotificationTaskActions.AssignedToCompany,
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
          this.notificationService.addToClientNotifications(
            { ...task, assigneeId: recipientIds[i], assigneeType: AssigneeType.client },
            notifications[i],
          ),
        )
      }
      await Promise.all(notificationPromises)
    }
  }

  private handleTaskArchiveToggle = async (prevTask: TaskWithWorkflowState, updatedTask: TaskWithWorkflowState) => {
    // Since we patch only one field at a time, we aren't at risk of
    // having both isArchived changed and assigneeId changed. AssigneeId of prev or updated will be same
    if (!prevTask.assigneeId) {
      return
    }
    // Case I: Task is archived from unarchived state
    if (updatedTask.isArchived) {
      const markAsRead =
        prevTask.assigneeType === AssigneeType.client
          ? this.notificationService.markClientNotificationAsRead
          : this.notificationService.markAsReadForAllRecipients
      await markAsRead(prevTask)
    } else {
      // Case II: Task is unarchived from archived state
      await this.sendTaskCreateNotifications(updatedTask)
    }
  }
}
