import { CopilotAPI } from '@/utils/CopilotAPI'
import { BaseService } from '@api/core/services/base.service'
import { AssigneeType, Task } from '@prisma/client'
import { NotificationTaskActions } from '@api/core/types/tasks'
import { z } from 'zod'
import { CompanyResponse, CopilotUser, MeResponse } from '@/types/common'
import { getEmailDetails, getInProductNotificationDetails } from '@api/notification/notification.helpers'

export class NotificationService extends BaseService {
  async create(action: NotificationTaskActions, task: Task) {
    try {
      const copilotUtils = new CopilotAPI(this.user.token)

      const { senderId, recipientId, actionUser } = await this.getNotificationParties(copilotUtils, task, action)

      const notificationDetails = {
        senderId,
        recipientId,
        deliveryTargets: {
          inProduct: getInProductNotificationDetails(actionUser)[action],
          email: getEmailDetails(actionUser)[action],
        },
      }

      await copilotUtils.createNotification(notificationDetails)
    } catch (error) {
      console.error(`Failed to send notification for action: ${action}`, error)
    }
  }

  async createBulkNotification(action: NotificationTaskActions, task: Task, recipientIds: string[]) {
    try {
      const copilotUtils = new CopilotAPI(this.user.token)
      const userInfo = await copilotUtils.me()
      if (!userInfo) {
        throw new Error(`User not found for token ${this.user.token}`)
      }
      const senderId = z.string().parse(userInfo.id)
      const actionUserName = `${userInfo.givenName} ${userInfo.familyName}`

      const promises = recipientIds.map((recipientId) => {
        const notificationDetails = {
          senderId,
          recipientId,
          deliveryTargets: {
            inProduct: getInProductNotificationDetails(actionUserName, task.title)[action],
            email: getEmailDetails(actionUserName, task.title)[action],
          },
        }

        return copilotUtils.createNotification(notificationDetails)
      })

      await Promise.all(promises)
    } catch (error) {
      console.error(`Failed to send notifications for action: ${action}`, error)
    }
  }

  /**
   * Get the concerned sender and receiver for a notification based on the action that triggered it. There are various actions
   * defined by NotificationTaskActions. This method returns the senderId, receiverId, and actionUser (user that is creating the notification action)
   * based on the NotificationTaskActions.
   */
  private async getNotificationParties(copilot: CopilotAPI, task: Task, action: NotificationTaskActions) {
    let senderId: string
    let recipientId: string
    let actionTrigger: CopilotUser | CompanyResponse

    const getAssignedTo = async (): Promise<CopilotUser | CompanyResponse> => {
      switch (task.assigneeType) {
        case AssigneeType.internalUser:
          return copilot.getInternalUser(senderId)
        case AssigneeType.client:
          return copilot.getClient(recipientId)
        case AssigneeType.company:
          return copilot.getCompany(recipientId)
        default:
          throw new Error(`Unknown assignee type: ${task.assigneeType}`)
      }
    }

    switch (action) {
      case NotificationTaskActions.Assigned:
        senderId = task.createdById
        recipientId = z.string().parse(task.assigneeId)
        actionTrigger = await copilot.getInternalUser(senderId)
        break
      case NotificationTaskActions.Completed:
        senderId = z.string().parse(task.assigneeId)
        recipientId = task.createdById
        actionTrigger = await getAssignedTo()
        break
      default:
        const userInfo = await copilot.me()
        senderId = z.string().parse(userInfo?.id)
        recipientId = z.string().parse(task.assigneeId)
        actionTrigger = userInfo as MeResponse
        break
    }

    const actionUser =
      task.assigneeType === AssigneeType.company
        ? (actionTrigger as CompanyResponse).name
        : `${(actionTrigger as CopilotUser).givenName} ${(actionTrigger as CopilotUser).familyName}`

    return { senderId, recipientId, actionUser }
  }
}
