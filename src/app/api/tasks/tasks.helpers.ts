import { NotificationTaskActions } from '@api/core/types/tasks'
import { AssigneeType, Task } from '@prisma/client'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { CompanyResponse, CopilotUser } from '@/types/common'
import { z } from 'zod'
import { CreateTaskRequest } from '@/types/dto/tasks.dto'
import User from '@api/core/models/User.model'

/**
 * Helper function that sets the in-product notification title and body for a given notification trigger
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
 * Helper function that sets the notification email details for a given notification trigger
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
 * Get the concerned sender and reciever for a notification based on the action that triggered it
 */
export const getNotificationParties = async (copilot: CopilotAPI, task: Task, action: NotificationTaskActions) => {
  let senderId: string
  let recipientIds: string[]
  // The IU/client/company that triggered this notification
  let sender: CopilotUser | CompanyResponse

  // Get info of the iu/client/company that a task was assigned to
  const getAssignedTo = async (id: string) => {
    if (task.assigneeType === AssigneeType.internalUser) {
      return await copilot.getInternalUser(id)
    } else if (task.assigneeType === AssigneeType.client) {
      return await copilot.getClient(id)
    } else {
      return await copilot.getCompany(id)
    }
  }

  const getTaskCompletionRecipients = async (task: Task) => {
    // What happens if client does not have a company id?
    const associatedCompanyId = z.string().parse(task.associatedCompanyId)

    return (await copilot.getInternalUsers()).data
      .filter(
        (internalUser) =>
          !internalUser.isClientAccessLimited && internalUser.companyAccessList.includes(associatedCompanyId),
      )
      .map((internalUser) => internalUser.id)
  }

  if (action === NotificationTaskActions.Assigned) {
    // Notification is sent by the person creating the task to the one it is assigned to.
    senderId = task.createdBy
    recipientIds = [z.string().parse(task.assigneeId)]
    // Notification action is triggered by the IU creating the task.
    sender = await copilot.getInternalUser(senderId)
  } else {
    // Notify the IU who created this task with the client / company as sender
    senderId = z.string().parse(task.assigneeId)
    recipientIds = await getTaskCompletionRecipients(task)
    // Since assignees can be company / iu / client, query details of who it was assigned to
    sender = await getAssignedTo(senderId)
  }

  // Get the name of the IU / client / company that triggered this notification
  const senderName =
    task.assigneeType === AssigneeType.company
      ? (sender as CompanyResponse).name
      : `${(sender as CopilotUser).givenName} ${(sender as CopilotUser).familyName}`

  return { senderId, recipientIds, senderName }
}

/**
 * Gets the companyId associated with an assignee based on its type (internalUser / client / company)
 * @param data Task payload for create / update
 * @param user Current request user
 * @returns companyId if exists else `null`
 */
export const getAssociatedCompanyId = async (data: CreateTaskRequest, user: User): Promise<string | null> => {
  const { assigneeId, assigneeType } = data

  if (!assigneeId || !assigneeType || assigneeType === AssigneeType.internalUser) {
    return null
  }

  if (assigneeType === AssigneeType.company) {
    return assigneeId
  }

  const copilotClient = new CopilotAPI(user.token)
  const client = await copilotClient.getClient(assigneeId)
  return client.companyId
}
