import { NotificationTaskActions } from '@api/core/types/tasks'
import { Task } from '@prisma/client'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { ClientResponse, CompanyResponse, CopilotUser, InternalUsers } from '@/types/common'

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
  // The IU/client/company that triggered this notification
  let actionTrigger: CopilotUser | CompanyResponse

  if (action === NotificationTaskActions.Assigned) {
    // Notification is sent by the person creating the task to the one it is assigned to.
    senderId = task.createdBy as string
    recipientId = task.assigneeId as string
    // Notification action is triggered by the IU creating the task.
    actionTrigger = await copilot.getInternalUser(senderId)
  } else {
    // Notify the IU who created this task with the client / company as sender
    senderId = task.assigneeId as string
    recipientId = task.createdBy
    // Since assignees can be company / iu / client, query details of who it was assigned to
    if (task.assigneeType === 'internalUser') {
      actionTrigger = await copilot.getInternalUser(senderId)
    } else if (task.assigneeType === 'client') {
      actionTrigger = await copilot.getClient(recipientId)
    } else {
      actionTrigger = await copilot.getCompany(recipientId)
    }
  }

  // Get the name of the IU / client / company that triggered this notification
  const actionUser =
    task.assigneeType === 'company'
      ? (actionTrigger as CompanyResponse).name
      : `${(actionTrigger as CopilotUser).givenName} ${(actionTrigger as CopilotUser).familyName}`

  return { senderId, recipientId, actionUser }
}
