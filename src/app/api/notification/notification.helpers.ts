import { NotificationTaskActions } from '@api/core/types/tasks'

/**
 * Helper function that sets the in-product notification title and body for a given notification trigger
 * @param {string} actionUser - The user's name that triggered this action.
 * @param {string} [taskName] - The optional task name for which the mention is triggered.
 * @returns {Object} An object with notification actions as keys and their corresponding title and body as values.
 * @returns {Object.<NotificationTaskActions, {title: string, body: string}>} - The notification details.
 */
export const getInProductNotificationDetails = (
  actionUser: string,
  taskName?: string,
): { [key in NotificationTaskActions]: { title: string; body: string } } => {
  return {
    [NotificationTaskActions.Assigned]: {
      title: 'Task was assigned to you',
      body: `A new task was assigned to you by ${actionUser}. To see details about the task, navigate to the Tasks App below.`,
    },
    [NotificationTaskActions.AssignedToCompany]: {
      title: 'Task was assigned to you your company',
      body: `A new task was assigned to your company by ${actionUser}. To see details about the task, navigate to the Tasks App below.`,
    },
    [NotificationTaskActions.Completed]: {
      title: 'A client completed a task',
      body: `A new task was completed by ${actionUser}. You are receiving this notification because you have access to the client.`,
    },
    [NotificationTaskActions.Commented]: {
      title: 'New comment on task',
      body: `A new comment was left by ${actionUser} on a task where you are set as the assignee. To see details about the task, navigate to the Tasks App below.`,
    },
    [NotificationTaskActions.Mentioned]: {
      title: 'You were mentioned in a task comment',
      body: `You were mentioned in a comment on task ${taskName} by ${actionUser}. To see details about the task, navigate to the Tasks App below. `,
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
  taskName?: string,
): { [key in NotificationTaskActions]: { title: string; subject: string; header: string; body: string } } => {
  return {
    [NotificationTaskActions.Assigned]: {
      title: 'Task was assigned to you',
      subject: 'Task was assigned to you',
      header: 'Task was assigned to you',
      body: `A new task was assigned to you by ${actionUser}. To see details about the task, navigate to the Tasks App below.`,
    },
    [NotificationTaskActions.AssignedToCompany]: {
      title: 'Task was assigned to your company',
      subject: 'Task was assigned to your company',
      header: 'Task was assigned to your company',
      body: `A new task was assigned to your company by ${actionUser}. To see details about the task, navigate to the Tasks App below.`,
    },
    [NotificationTaskActions.Completed]: {
      title: 'A client completed a task',
      subject: 'A client completed a task',
      header: 'A client completed a task',
      body: `A new task was completed by ${actionUser}. You are receiving this notification because you have access to the client.`,
    },
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
      body: `You were mentioned in a comment on task ${taskName} by ${actionUser}. To see details about the task, navigate to the Tasks App below. `,
    },
  }
}
