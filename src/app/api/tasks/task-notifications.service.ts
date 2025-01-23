import { NotificationCreatedResponseSchema } from '@/types/common'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { BaseService } from '@api/core/services/base.service'
import { NotificationTaskActions } from '@api/core/types/tasks'
import { NotificationService } from '@api/notification/notification.service'
import { AssigneeType, StateType, Task, WorkflowState } from '@prisma/client'

export class TaskNotificationsService extends BaseService {
  async removeDeletedTaskNotifications(task: Task & { workflowState: WorkflowState }) {
    const notificationsService = new NotificationService(this.user)
    if (task?.assigneeType && task.workflowState.type !== NotificationTaskActions.Completed) {
      const handleNotificationRead = {
        [AssigneeType.client]: notificationsService.markClientNotificationAsRead,
        [AssigneeType.company]: notificationsService.markAsReadForAllRecipients,
      }
      // @ts-expect-error This is completely safe
      await handleNotificationRead[task?.assigneeType]?.(task)
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

  async sendTaskUpdateNotifications(
    prevTask: Task & { workflowState: WorkflowState },
    updatedTask: Task & { workflowState: WorkflowState },
  ) {
    const notificationService = new NotificationService(this.user)

    // Handle archive status update.
    // If task is moved to archived -> Mark as read notifications
    // If task is moved to uarchived -> Add appropriate notification
    if (prevTask.isArchived !== updatedTask.isArchived) {
      return await this.handleTaskArchiveToggle(notificationService, prevTask, updatedTask)
    }

    if (prevTask.workflowStateId === updatedTask.workflowStateId) return
    /*
     * Cases:
     * 1. Assignee ID is changed for incomplete task -> Mark as read for previous recipients and trigger new notifications for new assignee
     * 2. Assignee ID is changed for completed task -> Do nothing
     * 3. Task was changed from incomplete to complete state -> delete all notifications for all users
     * 4. Task was changed from complete to incomplete state -> recreate those notifications
     */

    // Case 1
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

    // Case 3
    // --- If task was previously in another state, and is moved to a 'completed' type WorkflowState by IU
    let shouldCreateNotification = true
    if (
      prevTask?.workflowState?.type !== StateType.completed &&
      updatedTask?.workflowState?.type === StateType.completed &&
      updatedTask.assigneeId
    ) {
      // Don't send task notifications if the IU created the task themselves
      if (updatedTask.createdById === this.user.internalUserId) {
        shouldCreateNotification = false
      }

      if (updatedTask.assigneeType === AssigneeType.internalUser) {
        shouldCreateNotification &&
          (await notificationService.create(NotificationTaskActions.CompletedByIU, updatedTask, { disableEmail: true }))
        // TODO: Clean code and handle notification center notification deletions here instead
      } else if (updatedTask.assigneeType === AssigneeType.company) {
        // Don't do this in parallel since this can cause rate-limits, each of them has their own bottlenecks for avoiding ratelimits
        shouldCreateNotification &&
          (await notificationService.create(NotificationTaskActions.CompletedForCompanyByIU, updatedTask, {
            disableEmail: true,
          }))
        await notificationService.markAsReadForAllRecipients(updatedTask)
      } else if (updatedTask.assigneeType === AssigneeType.client) {
        shouldCreateNotification &&
          (await notificationService.create(NotificationTaskActions.CompletedByIU, updatedTask, { disableEmail: true }))
        try {
          await notificationService.markClientNotificationAsRead(updatedTask)
          return
        } catch (e: unknown) {
          console.error(`Failed to find ClientNotification for task ${updatedTask.id}`, e)
        }
      }
    }

    // Case 4
    // --- Handle task moved from completed to incomplete IU logic
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
    prevTask: Task & { workflowState: WorkflowState },
    updatedTask: Task & { workflowState: WorkflowState },
    updatedWorkflowState: WorkflowState | null,
  ) {
    // --------------------------
    // --- Notifications Logic
    // --------------------------

    // Cases:
    // 1. Task has been moved back to a non-complete state from completed for client task
    // 2. Task has been moved back to a non-complete state from completed for company task
    // 3. Task has been moved to complete state for client task
    // 4. Task has been moved to complete state for company task
    const notificationService = new NotificationService(this.user)

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
      await this.handleTaskCompleted(notificationService, updatedTask)
    }
  }

  private async handleTaskCompleted(notificationService: NotificationService, updatedTask: Task) {
    const copilot = new CopilotAPI(this.user.token)
    if (updatedTask.assigneeType === AssigneeType.company) {
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
      // Get every IU with access to company first
      const { recipientIds } = await notificationService.getNotificationParties(
        copilot,
        updatedTask,
        NotificationTaskActions.CompletedByCompanyMember,
      )
      await notificationService.createBulkNotification(NotificationTaskActions.Completed, updatedTask, recipientIds)
      await notificationService.markClientNotificationAsRead(updatedTask)
    }
  }

  private async sendUserTaskNotification(task: Task, notificationService: NotificationService, isReassigned = false) {
    const notification = await notificationService.create(
      //! In future when reassignment is supported, change this logic to support reassigned to client as well
      isReassigned ? NotificationTaskActions.ReassignedToIU : NotificationTaskActions.Assigned,
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
      await notificationService.addToClientNotifications(task, NotificationCreatedResponseSchema.parse(notification))
    }
  }

  private sendCompanyTaskNotifications = async (
    task: Task,
    notificationService: NotificationService,
    _isReassigned = false, // someday this will come in handy
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

  private async handleTaskArchiveToggle(
    notificationService: NotificationService,
    prevTask: Task & { workflowState: WorkflowState },
    updatedTask: Task & { workflowState: WorkflowState },
  ) {
    // Since we patch only one field at a time, we aren't at risk of
    // having both isArchived changed and assigneeId changed. AssigneeId of prev or updated will be same
    if (!prevTask.assigneeId) {
      return
    }
    // Case I: Task is archived from unarchived state
    if (updatedTask.isArchived) {
      const markAsRead =
        prevTask.assigneeType === AssigneeType.client
          ? notificationService.markClientNotificationAsRead
          : notificationService.markAsReadForAllRecipients
      await markAsRead(prevTask)
    } else {
      // Case II: Task is unarchived from archived state
      await this.sendTaskCreateNotifications(updatedTask)
    }
  }
}
