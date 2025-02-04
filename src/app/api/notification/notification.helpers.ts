import { NotificationTaskActions } from '@api/core/types/tasks'
import { Task } from '@prisma/client'

/**
 * Helper function that sets the in-product notification title and body for a given notification trigger
 * @param {string} actionUser - The user's name that triggered this action.
 * @param {Task} [task] - The task for which the mention is triggered.
 * @param {{companyName?: string, commentId?: string}} [opts] - Opts for optional notification fields
 * @returns {Object} An object with notification actions as keys and their corresponding title and body as values.
 * @returns {Object.<NotificationTaskActions, {title: string, body: string}>} - The notification details.
 */
export const getInProductNotificationDetails = (
  actionUser: string,
  task?: Task,
  opts?: {
    companyName?: string
    commentId?: string
  },
): { [key in NotificationTaskActions]: { title: string; body: string; ctaParams?: Record<string, unknown> } } => {
  const ctaParams =
    task || opts?.commentId
      ? {
          ...(task && { taskId: task.id }),
          ...(opts?.commentId && { commentId: opts?.commentId }),
        }
      : undefined

  const commentDetail = {
    title: 'Comment was added',
    body: `${actionUser} left a comment on the task ‘${task?.title}’.`,
    ctaParams,
  }

  return {
    [NotificationTaskActions.Assigned]: {
      title: 'Task was assigned to you',
      body: `The task ‘${task?.title}’  was created and assigned to you by ${actionUser}. To see details about the task, navigate to the Tasks App below.`,
      ctaParams,
    },
    [NotificationTaskActions.AssignedToCompany]: {
      title: 'Task was assigned to your company',
      body: `A new task ‘${task?.title}’ was assigned to your company by ${actionUser}. To see details about the task, navigate to the Tasks App below.`,
    },

    [NotificationTaskActions.ReassignedToIU]: {
      title: 'Task was reassigned to you',
      body: `The task ‘${task?.title}’ was reassigned to you by ${actionUser}. To see details about the task, navigate to the Tasks App below.`,
      ctaParams,
    },
    [NotificationTaskActions.ReassignedToClient]: {
      title: 'View task',
      body: `The task ‘${task?.title}’ was reassigned to you by ${actionUser}. To see details about the task open it below.`,
      ctaParams,
    },
    [NotificationTaskActions.ReassignedToCompany]: {
      title: 'View task',
      body: `The task ‘${task?.title}’ was reassigned to your company by ${actionUser}. To see details about the task open it below.`,
      ctaParams,
    },

    [NotificationTaskActions.CompletedByCompanyMember]: {
      title: 'Task was completed',
      body: `The task ‘${task?.title}’ was completed by ${actionUser} for ${opts?.companyName}.`,
      ctaParams,
    },
    [NotificationTaskActions.CompletedForCompanyByIU]: {
      title: 'Task was completed',
      body: `The task ‘${task?.title}’ was completed by ${actionUser} for ${opts?.companyName}.`,
      ctaParams,
    },
    [NotificationTaskActions.Completed]: {
      title: 'Task was completed',
      body: `The task ‘${task?.title}’ was completed by ${actionUser}.`,
      ctaParams,
    },
    [NotificationTaskActions.CompletedByIU]: {
      title: 'Task was completed',
      body: `The task ‘${task?.title}’ was completed by ${actionUser}.`,
      ctaParams,
    },

    [NotificationTaskActions.Commented]: commentDetail,
    [NotificationTaskActions.CommentToCU]: commentDetail,
    [NotificationTaskActions.CommentToIU]: commentDetail,
    [NotificationTaskActions.Mentioned]: {
      title: 'You were mentioned in a task comment',
      body: `You were mentioned in a comment on task ‘${task?.title}’ by ${actionUser}. To see details about the task, navigate to the Tasks App below. `,
      ctaParams,
    },
  }
}

/**
 * Helper function that sets the notification email details for a given notification trigger.
 * @param {string} actionUser - The user's name that triggered this action.
 * @param {Task} [task] - The task for which the mention is triggered.
 * @param {{commentId?: string}} [opts] - Opts for optional notification fields
 * @returns {object} - The email notification details.
 */
export const getEmailDetails = (
  actionUser: string,
  task?: Task,
  opts?: {
    commentId?: string
  },
): Partial<{
  [key in NotificationTaskActions]: {
    title: string
    subject: string
    header: string
    body: string
    ctaParams?: Record<string, string>
  }
}> => {
  const ctaParams =
    task || opts?.commentId
      ? {
          ...(task && { taskId: task.id }),
          ...(opts?.commentId && { commentId: opts?.commentId }),
        }
      : undefined

  return {
    [NotificationTaskActions.Assigned]: {
      subject: 'A task was assigned to you',
      header: 'A task was assigned to you',
      body: `The task ‘${task?.title}’ was assigned to you by ${actionUser}. To see details about the task, open it below.`,
      title: 'View task',
      ctaParams,
    },
    [NotificationTaskActions.AssignedToCompany]: {
      subject: 'Task was assigned to your company',
      header: 'Task was assigned to your company',
      body: `A new task ‘${task?.title}’ was assigned to your company by ${actionUser}. To see details about the task, open it below.`,
      title: 'View task',
      ctaParams,
    },
    //! Currently disable all IU email notifications
    // [NotificationTaskActions.Completed]: {
    //   title: 'A client completed a task',
    //   subject: 'A client completed a task',
    //   header: 'A client completed a task',
    //   body: `A new task was completed by ${actionUser}. You are receiving this notification because you have access to the client.`,
    // },
    [NotificationTaskActions.Commented]: {
      subject: 'Comment was added',
      header: 'Comment was added',
      body: `${actionUser} left a comment on the task ‘${task?.title}’. To view the comment, open the task below.`,
      title: 'View comment',
      ctaParams,
    },
    [NotificationTaskActions.Mentioned]: {
      subject: 'You were mentioned in a task comment',
      header: 'You were mentioned in a task comment',
      body: `You were mentioned in a comment on task ‘${task?.title}’ by ${actionUser}. To see details about the task, navigate to the Tasks App below. `,
      title: 'View task',
      ctaParams,
    },
    [NotificationTaskActions.ReassignedToClient]: {
      subject: 'A task was reassigned to you',
      header: 'A task was reassigned to you',
      title: 'View task',
      body: `The task ‘${task?.title}’ was reassigned to you by ${actionUser}. To see details about the task open it below.`,
      ctaParams,
    },
    [NotificationTaskActions.ReassignedToCompany]: {
      subject: 'A task was reassigned to your company',
      header: 'A task was reassigned to your company',
      title: 'View task',
      body: `The task ‘${task?.title}’ was reassigned to your company by ${actionUser}. To see details about the task open it below.`,
      ctaParams,
    },
  }
}
