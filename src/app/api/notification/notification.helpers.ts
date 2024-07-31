import { NotificationTaskActions } from '@api/core/types/tasks'
import { Task } from '@prisma/client'

/**
 * Helper function that sets the in-product notification title and body for a given notification trigger
 * @param {string} actionUser - The user's name that triggered this action.
 * @param {string} [taskName] - The optional task name for which the mention is triggered.
 * @returns {Object} An object with notification actions as keys and their corresponding title and body as values.
 * @returns {Object.<NotificationTaskActions, {title: string, body: string}>} - The notification details.
 */
export const getInProductNotificationDetails = (
  actionUser: string,
  task?: Task,
  companyName?: string,
): { [key in NotificationTaskActions]: { title: string; body: string; ctaParams?: Record<string, unknown> } } => {
  const ctaParams = { taskId: task?.id }

  return {
    [NotificationTaskActions.Assigned]: {
      title: 'Task was assigned to you',
      body: `The task ‘${task?.title}’  was created and assigned to you by ${actionUser}. To see details about the task, navigate to the Tasks App below.`,
      ctaParams,
    },
    [NotificationTaskActions.AssignedToCompany]: {
      title: 'Task was assigned to your company',
      body: `A new task was assigned to your company by ${actionUser}. To see details about the task, navigate to the Tasks App below.`,
    },
    [NotificationTaskActions.ReassignedToIU]: {
      title: 'Task was reassigned to you',
      body: `The task ‘${task?.title}’ was reassigned to you by ${actionUser}. To see details about the task, navigate to the Tasks App below.`,
      ctaParams,
    },
    [NotificationTaskActions.CompletedByCompanyMember]: {
      title: 'Task was completed',
      body: `The task ‘${task?.title}’ was completed by ${actionUser} for ${companyName}. You are receiving this notification because you have access to the client.`,
      ctaParams,
    },
    [NotificationTaskActions.Completed]: {
      title: 'Task was completed',
      body: `The task ‘${task?.title}’ was completed by ${actionUser}. You are receiving this notification because you have access to the client.`,
      ctaParams,
    },
    [NotificationTaskActions.Commented]: {
      title: 'New comment on task',
      body: `A new comment was left by ${actionUser} on a task where you are set as the assignee. To see details about the task, navigate to the Tasks App below.`,
      ctaParams,
    },
    [NotificationTaskActions.Mentioned]: {
      title: 'You were mentioned in a task comment',
      body: `You were mentioned in a comment on task ${task?.title} by ${actionUser}. To see details about the task, navigate to the Tasks App below. `,
      ctaParams,
    },
  }
}

/**
 * Helper function that sets the notification email details for a given notification trigger.
 * @param {string} actionUser - The user's name that triggered this action.
 * @param {string} [taskName] - The optional task name for which the mention is triggered.
 * @returns {object} - The email notification details.
 * @todo Right now its the same as in-product details, change this after finalizing email details.
 */
export const getEmailDetails = (
  actionUser: string,
  task?: Task,
): Partial<{ [key in NotificationTaskActions]: { title: string; subject: string; header: string; body: string } }> => {
  return {
    [NotificationTaskActions.Assigned]: {
      title: 'A task was assigned to you',
      subject: 'A task was assigned to you',
      header: 'A task was assigned to you',
      body: `The task ‘${task?.title}’ was assigned to you by ${actionUser}. To see details about the task open it below. `,
    },
    [NotificationTaskActions.AssignedToCompany]: {
      title: 'Task was assigned to your company',
      subject: 'Task was assigned to your company',
      header: 'Task was assigned to your company',
      body: `A new task was assigned to your company by ${actionUser}. To see details about the task, navigate to the Tasks App below.`,
    },
    //! Currently disable all IU email notifications
    // [NotificationTaskActions.Completed]: {
    //   title: 'A client completed a task',
    //   subject: 'A client completed a task',
    //   header: 'A client completed a task',
    //   body: `A new task was completed by ${actionUser}. You are receiving this notification because you have access to the client.`,
    // },
    [NotificationTaskActions.Commented]: {
      subject: 'New comment on task',
      header: 'New comment on task',
      title: 'New comment on task',
      body: `A new comment was left by ${actionUser} on a task where you are set as the assignee. To see details about the task, navigate to the Tasks App below.`,
    },
    [NotificationTaskActions.Mentioned]: {
      subject: 'You were mentioned in a task comment',
      header: 'You were mentioned in a task comment',
      title: 'You were mentioned in a task comment',
      body: `You were mentioned in a comment on task ${task?.title} by ${actionUser}. To see details about the task, navigate to the Tasks App below. `,
    },
  }
}
