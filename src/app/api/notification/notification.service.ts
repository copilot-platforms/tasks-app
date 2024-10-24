import { CopilotAPI } from '@/utils/CopilotAPI'
import { BaseService } from '@api/core/services/base.service'
import { AssigneeType, ClientNotification, Task } from '@prisma/client'
import { NotificationTaskActions } from '@api/core/types/tasks'
import { z } from 'zod'
import { CompanyResponse, CopilotUser, MeResponse, NotificationCreatedResponse } from '@/types/common'
import { getEmailDetails, getInProductNotificationDetails } from '@api/notification/notification.helpers'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'
import Bottleneck from 'bottleneck'

export class NotificationService extends BaseService {
  async create(action: NotificationTaskActions, task: Task, disable: { email: boolean } = { email: false }) {
    try {
      const copilot = new CopilotAPI(this.user.token)

      const { senderId, recipientId, actionUser, companyName } = await this.getNotificationParties(copilot, task, action)

      const inProduct = getInProductNotificationDetails(actionUser, task, companyName)[action]
      const email = disable.email ? undefined : getEmailDetails(actionUser, task)[action]
      const notificationDetails = {
        senderId,
        recipientId,
        // If any of the given action is not present in details obj, that type of notification is not sent
        deliveryTargets: { inProduct, email },
      }

      const notification = await copilot.createNotification(notificationDetails)
      if (
        [
          NotificationTaskActions.Completed,
          NotificationTaskActions.CompletedByIU,
          NotificationTaskActions.CompletedForCompanyByIU,
          NotificationTaskActions.CompletedByCompanyMember,
        ].includes(action)
      ) {
        // Notification recipient is IU in this case
        await this.db.internalUserNotification.create({
          data: {
            internalUserId: recipientId,
            notificationId: notification.id,
            taskId: task.id,
          },
        })
      }
      return notification
    } catch (error) {
      console.error(`Failed to send notification for action: ${action}`, error)
    }
  }

  async createBulkNotification(
    action: NotificationTaskActions,
    task: Task,
    recipientIds: string[],
    enable?: { email: boolean },
  ) {
    try {
      const copilot = new CopilotAPI(this.user.token)
      const userInfo = await copilot.me()
      if (!userInfo) {
        throw new APIError(httpStatus.NOT_FOUND, `User not found for token ${this.user.token}`)
      }
      const senderId = z.string().parse(userInfo.id)
      const actionUserName = `${userInfo.givenName} ${userInfo.familyName}`

      const company =
        task?.assigneeId && task?.assigneeType === AssigneeType.company
          ? await copilot.getCompany(task?.assigneeId)
          : undefined
      const inProduct = getInProductNotificationDetails(actionUserName, task, company?.name)[action]
      const email = enable?.email ? getEmailDetails(actionUserName, task)[action] : undefined

      const notifications = []
      for (let recipientId of recipientIds) {
        try {
          const notificationDetails = {
            senderId,
            recipientId,
            deliveryTargets: { inProduct, email },
          }
          notifications.push(await copilot.createNotification(notificationDetails))
        } catch (err: unknown) {
          console.error(`Failed to send notifications to ${recipientId}:`, err)
        }
      }
      // TODO: Optimize to run parallely and not hit rate limits
      return notifications
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

  deleteInternalUserNotificationForTask = async (taskId: string) => {
    const copilot = new CopilotAPI(this.user.token)
    const notifications = await this.db.internalUserNotification.findMany({ where: { taskId } })
    const markAsReadPromises = []
    const bottleneck = new Bottleneck({ minTime: 250, maxConcurrent: 2 })
    for (let notification of notifications) {
      markAsReadPromises.push(
        // Mark IU notification as read
        bottleneck.schedule(() => {
          return copilot.deleteNotification(notification.notificationId)
        }),
      )
    }
    console.info(`Deleting all notifications triggerd by task ${taskId}`)
    await Promise.all(markAsReadPromises)
    await this.db.internalUserNotification.deleteMany({ where: { taskId } })
  }

  /**
   * Marks a client notification in Copilot Notifications service as read
   * @param id Notification ID for object as exists in Copilot
   */
  markClientNotificationAsRead = async (task: Task) => {
    const copilot = new CopilotAPI(this.user.token)
    try {
      const relatedNotification = await this.db.clientNotification.findFirst({
        where: {
          clientId: z.string().parse(task.assigneeId),
          taskId: task.id,
        },
      })
      if (!relatedNotification) {
        console.error(
          `Failed to delete client notification for task id ${task.id} because the notification for client ${task.assigneeId} was not found`,
        )
        return
      }

      await copilot.markNotificationAsRead(relatedNotification.notificationId)
      await this.db.clientNotification.delete({ where: { id: relatedNotification?.id } })
    } catch (e: unknown) {
      // There may be cases where existing notification has not been updated in the ClientNotifications table yet
      // So don't let it crash the entire program, instead just log it to stderr
      console.error(`Failed to delete client notification for task id ${task.id}`, e)
    }
  }

  markAsReadForAllRecipients = async (task: Task) => {
    const copilot = new CopilotAPI(this.user.token)
    const { recipientIds } = await this.getNotificationParties(copilot, task, NotificationTaskActions.AssignedToCompany)

    for (let recipientId of recipientIds) {
      await this.markClientNotificationAsRead({
        ...task,
        assigneeId: recipientId,
        assigneeType: AssigneeType.client,
      })
    }

    // TODO: Optimized Mark as read while preventing burst ratelimits - will probably implement `bottleneck` package for this
    // const markAsReadPromises = recipientIds.map((recipientId) =>
    //   this.markClientNotificationAsRead({
    //     ...task,
    //     assigneeId: recipientId,
    //     assigneeType: AssigneeType.client,
    //   }),
    // )
  }

  async markAllAsReadForClients(copilot: CopilotAPI, tasks: Task[], clientIds: string[]) {
    const notifications = await this.db.clientNotification.findMany({
      where: {
        taskId: { in: tasks.map((task) => task.id) },
        clientId: { in: clientIds },
      },
    })

    // Get an array of notification ids for Copilot API
    const notificationPromises = []
    const bottleneck = new Bottleneck({ minTime: 250, maxConcurrent: 4 })
    for (let notification of notifications) {
      const promise = bottleneck.schedule(() => copilot.markNotificationAsRead(notification.notificationId))
      notificationPromises.push(promise)
    }
    await Promise.all(notificationPromises)
    await this.db.clientNotification.deleteMany({ where: { id: { in: notifications.map((obj) => obj.id) } } })
  }

  /**
   * Get the concerned sender and receiver for a notification based on the action that triggered it. There are various actions
   * defined by NotificationTaskActions. This method returns the senderId, receiverId, and actionUser (user that is creating the notification action)
   * based on the NotificationTaskActions.
   */
  async getNotificationParties(copilot: CopilotAPI, task: Task, action: NotificationTaskActions) {
    let senderId: string
    let recipientId: string = ''
    let recipientIds: string[] = []
    let actionTrigger: CopilotUser | CompanyResponse
    let companyName: string | undefined

    const getAssignedTo = async (): Promise<CopilotUser | CompanyResponse> => {
      switch (task.assigneeType) {
        case AssigneeType.internalUser:
          return await copilot.getInternalUser(senderId)
        case AssigneeType.client:
          return await copilot.getClient(z.string().uuid().parse(task.assigneeId))
        case AssigneeType.company:
          return await copilot.getCompany(z.string().parse(task.assigneeId))
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
      case NotificationTaskActions.AssignedToCompany:
        senderId = task.createdById
        recipientIds = (await copilot.getCompanyClients(z.string().parse(task.assigneeId))).map((client) => client.id)
        actionTrigger = await copilot.getInternalUser(senderId)
        break
      case NotificationTaskActions.CompletedByCompanyMember:
        senderId = z.string().parse(task.assigneeId)
        const internalUsers = await copilot.getInternalUsers()
        recipientIds = internalUsers.data
          .filter((iu) =>
            iu.isClientAccessLimited ? iu.companyAccessList?.includes(z.string().parse(task.assigneeId)) : true,
          )
          .map((iu) => iu.id)
        actionTrigger = await getAssignedTo()
        break
      case NotificationTaskActions.Completed:
        senderId = z.string().parse(task.assigneeId)
        recipientId = task.createdById
        actionTrigger = await getAssignedTo()
        break
      case NotificationTaskActions.CompletedForCompanyByIU:
        const company = await copilot.getCompany(z.string().parse(task.assigneeId))
        companyName = company.name
      case NotificationTaskActions.CompletedByIU:
        senderId = z.string().parse(this.user.internalUserId)
        recipientId = task.createdById
        actionTrigger = await copilot.getInternalUser(senderId)
        break
      default:
        const userInfo = await copilot.me()
        senderId = z.string().parse(userInfo?.id)
        recipientId = z.string().parse(task.assigneeId)
        actionTrigger = userInfo as CopilotUser
        break
    }

    let actionUser =
      task.assigneeType === AssigneeType.company && action !== NotificationTaskActions.CompletedForCompanyByIU
        ? (actionTrigger as CompanyResponse).name
        : `${(actionTrigger as CopilotUser).givenName} ${(actionTrigger as CopilotUser).familyName}`

    return { senderId, recipientId, recipientIds, actionUser, companyName }
  }
}
