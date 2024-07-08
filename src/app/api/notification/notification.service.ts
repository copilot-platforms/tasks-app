import { CopilotAPI } from '@/utils/CopilotAPI'
import { BaseService } from '@api/core/services/base.service'
import { AssigneeType, ClientNotification, Task } from '@prisma/client'
import { NotificationTaskActions } from '@api/core/types/tasks'
import { z } from 'zod'
import { CompanyResponse, CopilotUser, MeResponse, NotificationCreatedResponse } from '@/types/common'
import { getEmailDetails, getInProductNotificationDetails } from '@api/notification/notification.helpers'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'

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

      return await copilotUtils.createNotification(notificationDetails)
    } catch (error) {
      console.error(`Failed to send notification for action: ${action}`, error)
    }
  }

  async createBulkNotification(action: NotificationTaskActions, task: Task, recipientIds: string[]) {
    try {
      const copilotUtils = new CopilotAPI(this.user.token)
      const userInfo = await copilotUtils.me()
      if (!userInfo) {
        throw new APIError(httpStatus.NOT_FOUND, `User not found for token ${this.user.token}`)
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
   * Adds a ClientNotification column associated with a task
   * @param task Associated task
   * @param notification Associated notification
   * @returns New ClientNotification object
   */
  async addToClientNotifications(task: Task, notification: NotificationCreatedResponse): Promise<ClientNotification> {
    return await this.db.clientNotification.create({
      data: {
        clientId: z.string().parse(notification.recipientId),
        notificationId: notification.id,
        taskId: task.id,
      },
    })
  }

  /**
   * Marks a client notification in Copilot Notifications service as read
   * @param id Notification ID for object as exists in Copilot
   */
  async markClientNotificationAsRead(task: Task) {
    const copilot = new CopilotAPI(this.user.token)
    try {
      const relatedNotification = await this.db.clientNotification.findFirst({
        where: {
          clientId: z.string().parse(task.assigneeId),
          taskId: task.id,
        },
      })
      if (!relatedNotification)
        throw new APIError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to delete client notification for task id ${task.id}`)

      await copilot.markNotificationAsRead(relatedNotification.notificationId)
      await this.db.clientNotification.delete({ where: { id: relatedNotification?.id } })
    } catch (e: unknown) {
      // There may be cases where existing notification has not been updated in the ClientNotifications table yet
      // So don't let it crash the entire program, instead just log it to stderr
      console.error(`Failed to delete client notification for task id ${task.id}`, e)
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
          throw new APIError(httpStatus.NOT_FOUND, `Unknown assignee type: ${task.assigneeType}`)
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
