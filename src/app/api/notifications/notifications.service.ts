import { ClientNotificationDataSchema, InternalUserNotificationDataSchema } from '@/types/db'
import { bottleneck } from '@/utils/bottleneck'
import { CopilotAPI } from '@/utils/CopilotAPI'
import APIError from '@api/core/exceptions/api'
import User from '@api/core/models/User.model'
import { BaseService } from '@api/core/services/base.service'
import { UserRole } from '@api/core/types/user'
import httpStatus from 'http-status'
import { z } from 'zod'

type NotificationDetails = {
  title: string
  body: string
  ctaParams?: Record<string, string>
}

/**
 * New notifications service to facilitate predictable notifications behavior
 */
class NotificationsService extends BaseService {
  private copilot: CopilotAPI

  constructor(user: User) {
    super(user)
    this.copilot = new CopilotAPI(this.user.token)
  }

  /**
   * Sends a notification to multiple clients on behalf of a copilot senderId
   */
  async send(
    sendNotificationTo: UserRole,
    identifiers: {
      senderId: string
      recipientIds: string[]
      taskId: string
    },
    opts: { email?: NotificationDetails; inProduct?: NotificationDetails },
  ) {
    // First send task notifications
    const notificationPromises = []
    const { taskId, senderId, recipientIds } = identifiers
    const { email, inProduct } = opts
    if (!inProduct && !email) {
      throw new APIError(httpStatus.INTERNAL_SERVER_ERROR, 'Did not find inProduct or email notification details')
    }
    for (const recipientId of recipientIds) {
      const notificationDetails = {
        senderId,
        recipientId,
        deliveryTargets: { inProduct, email },
      }
      notificationPromises.push(
        bottleneck
          .schedule(() => this.copilot.createNotification(notificationDetails))
          .catch((err: unknown) =>
            console.error('Could not send notification with details', notificationDetails, '\nError:', err),
          ),
      )
    }
    const notifications = await Promise.all(notificationPromises)
    if (!notifications) {
      console.error(
        `NotificationService#send | Failed to send ALL notifications for type ${sendNotificationTo} for task`,
        taskId,
        '\nSender:',
        senderId,
        '\nRecipient:',
        recipientIds,
        '\nopts:',
        opts,
      )
      return
    }

    // Now add those notifications to related client / iu notifications table
    const data = []
    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i]
      if (!notification) {
        // This has already been handled above
        continue
      }
      if (sendNotificationTo === UserRole.IU) {
        data.push({
          internalUserId: recipientIds[i],
          notificationId: notification.id,
          taskId,
        })
      } else {
        data.push({
          clientId: recipientIds[i],
          notificationId: notification.id,
          taskId,
        })
      }
    }
    if (sendNotificationTo === UserRole.IU) {
      await this.db.internalUserNotification.createMany({ data: z.array(InternalUserNotificationDataSchema).parse(data) })
    } else {
      await this.db.clientNotification.createMany({ data: z.array(ClientNotificationDataSchema).parse(data) })
    }

    return notifications
  }

  /**
   * Marks a single Copilot Notification as read
   */
  private async markAsRead(notificationId: string) {
    return await this.copilot.markNotificationAsRead(notificationId)
  }

  /**
   * Bulk-marks Copilot Notifications as read
   * @param {UserRole} type: The type of user notifications are sent to
   * @param {string[]} notificationIds: *Copilot* Notification ids
   */
  async markAllAsRead(type: UserRole, notificationIds: string[]) {
    const markAsReadPromises = []
    for (const notificationId of notificationIds) {
      markAsReadPromises.push(
        bottleneck.schedule(() =>
          this.markAsRead(notificationId).catch((err: unknown) =>
            console.error('Failed to markAsRead notification with id', notificationId, '\nError:', err),
          ),
        ),
      )
    }
    const readNotificationIds = await Promise.all(markAsReadPromises)
    const validNotificationIds = readNotificationIds.filter((id): id is string => !!id)
    if (type === UserRole.IU) {
      await this.db.internalUserNotification.deleteMany({ where: { notificationId: { in: validNotificationIds } } })
    } else {
      await this.db.clientNotification.deleteMany({ where: { notificationId: { in: validNotificationIds } } })
    }
    return readNotificationIds
  }
}

export default NotificationsService
