import { NotificationTaskActions } from '@api/core/types/tasks'
import User from '@api/core/models/User.model'
import { Task } from '@prisma/client'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { ClientResponse, InternalUsers } from '@/types/common'

type GetInProductNotificationDetailsArgs = {
  assignedBy?: string
  clientName?: string
}

/**
 * Helper function that helps you get the in-product notification title and body for a given action
 * @param actionUser The user's name that triggered this action.
 */
export const getInProductNotificationDetails = (actionUser: string) => {
  return {
    [NotificationTaskActions.Assigned]: {
      title: 'Task was assigned to you',
      body: `A new task was assigned to you by ${actionUser}. To see details about the task, navigate to the Tasks App below.`,
    },
    [NotificationTaskActions.Completed]: {
      title: 'A client completed a task',
      body: `A new task was completed by ${actionUser}. You are receiving this notification because you have access to the client.`,
    },
  }
}

/**
 * Helper function that helps you get the notification email details for a given action
 * @param actionUser The user's name that triggered this action.
 * TODO: Right now its the same as in-product details, change this after finalizing email details
 */
export const getEmailDetails = (actionUser: string) => {
  return {
    [NotificationTaskActions.Assigned]: {
      title: 'Task was assigned to you',
      subject: 'Task was assigned to you',
      header: 'Task was assigned to you',
      body: `A new task was assigned to you by ${actionUser}. To see details about the task, navigate to the Tasks App below.`,
    },
    [NotificationTaskActions.Completed]: {
      title: 'A client completed a task',
      subject: 'A client completed a task',
      header: 'A client completed a task',
      body: `A new task was completed by ${actionUser}. You are receiving this notification because you have access to the client.`,
    },
  }
}

/**
 * Figures out the concerned sender and reciever for a notification based on the action that triggered it
 */
export const getNotificationParties = async (copilot: CopilotAPI, task: Task, action: NotificationTaskActions) => {
  let senderId: string
  let recipientId: string
  // the user who assigned task to user OR the client who completed the task. Used to fetch the name of that particular IU/Client
  let actionUser: InternalUsers | ClientResponse

  if (action === NotificationTaskActions.Assigned) {
    senderId = task.createdBy as string
    recipientId = task.assigneeId as string
    actionUser = await copilot.getInternalUser(senderId)
  } else {
    senderId = task.assigneeId as string
    recipientId = task.createdBy // Report back to the IU who created this task

    actionUser =
      task.assigneeType === 'internalUser' ? await copilot.getInternalUser(senderId) : await copilot.getClient(recipientId)
  }

  return { senderId, recipientId, actionUser: `${actionUser.givenName} ${actionUser.familyName}` }
}
