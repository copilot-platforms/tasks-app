import { CompanyResponse, CopilotUser, NotificationCreatedResponse } from '@/types/common'
import { bottleneck } from '@/utils/bottleneck'
import { CopilotAPI } from '@/utils/CopilotAPI'
import APIError from '@api/core/exceptions/api'
import { BaseService } from '@api/core/services/base.service'
import { NotificationTaskActions } from '@api/core/types/tasks'
import { getEmailDetails, getInProductNotificationDetails } from '@api/notification/notification.helpers'
import { AssigneeType, ClientNotification, Task } from '@prisma/client'
import Bottleneck from 'bottleneck'
import httpStatus from 'http-status'
import { z } from 'zod'

export class NotificationService extends BaseService {
  async create(
    action: NotificationTaskActions,
    task: Task,
    opts: { disableEmail: boolean; disableInProduct?: boolean; commentId?: string } = {
      disableEmail: false,
    },
  ) {
    try {
      const copilot = new CopilotAPI(this.user.token)

      const { senderId, recipientId, actionUser, companyName } = await this.getNotificationParties(copilot, task, action)

      const inProduct = opts.disableInProduct
        ? undefined
        : getInProductNotificationDetails(actionUser, task, { companyName, commentId: opts?.commentId })[action]

      const email = opts.disableEmail ? undefined : getEmailDetails(actionUser, task, { commentId: opts?.commentId })[action]

      const notificationDetails = {
        senderId,
        recipientId,
        // If any of the given action is not present in details obj, that type of notification is not sent
        deliveryTargets: { inProduct, email },
      }
      console.info('NotificationService#create | Creating single notification:', notificationDetails)

      const notification = await copilot.createNotification(notificationDetails)
      // NOTE: There are cases where task.assigneeType does not account for IU notification!
      // E.g. When receiving notifications from others completing task that IU created.
      // For now we don't have to store these so this hasn't been accounted for
      const shouldSendIUNotification =
        task.assigneeType === AssigneeType.internalUser &&
        (action === NotificationTaskActions.Assigned || action === NotificationTaskActions.ReassignedToIU)
      if (shouldSendIUNotification) {
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
    opts?: { email?: boolean; disableInProduct?: boolean; commentId?: string },
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
      const inProduct = opts?.disableInProduct
        ? undefined
        : getInProductNotificationDetails(actionUserName, task, {
            companyName: company?.name,
            commentId: opts?.commentId,
          })[action]
      const email = opts?.email ? getEmailDetails(actionUserName, task, { commentId: opts?.commentId })[action] : undefined

      const notifications = []
      for (let recipientId of recipientIds) {
        try {
          const notificationDetails = {
            senderId,
            recipientId,
            deliveryTargets: { inProduct, email },
          }
          console.info('NotificationService#bulkCreate | Creating single notification:', notificationDetails)

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
        companyId: task.companyId,
      },
    })
  }

  deleteInternalUserNotificationsForTask = async (taskId: string) => {
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
    // Hard delete this since we are not marking these as read, but deleting them
    await this.db.$executeRaw`
      DELETE FROM "InternalUserNotifications"
      WHERE "taskId" = ${taskId}::uuid
    `
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

  async bulkMarkAsRead(notificationIds: string[]): Promise<void> {
    const copilot = new CopilotAPI(this.user.token)
    const markAsReadPromises = []
    for (const id of notificationIds) {
      markAsReadPromises.push(bottleneck.schedule(() => copilot.markNotificationAsRead(id)))
    }
    await Promise.all(markAsReadPromises)
  }

  /**
   * Get the concerned sender and receiver for a notification based on the action that triggered it. There are various actions
   * defined by NotificationTaskActions. This method returns the senderId, receiverId, and actionUser (user that is creating the notification action)
   * based on the NotificationTaskActions.
   */
  async getNotificationParties(copilot: CopilotAPI, task: Task, action: NotificationTaskActions) {
    let senderId: string = ''
    let recipientId: string = ''
    let recipientIds: string[] = []
    let actionTrigger: CopilotUser | CompanyResponse | null = null
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
        const client =
          task.assigneeType === AssigneeType.client
            ? await copilot.getClient(z.string().uuid().parse(task.assigneeId))
            : undefined
        recipientIds = internalUsers.data
          .filter((iu) =>
            iu.isClientAccessLimited
              ? iu.companyAccessList?.includes(client?.companyId || z.string().parse(task.assigneeId))
              : true,
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
      case NotificationTaskActions.CommentToCU:
        if (task.assigneeType === AssigneeType.client && task.assigneeId) {
          // the client is the assignee, they are part of the task
          recipientIds = [task.assigneeId]
        } else if (task.assigneeType === AssigneeType.company && task.assigneeId) {
          // this task is assigned to the company so all clients in company
          // should be considered as the recipients of the comment
          console.info('fetching clients for company:', task.assigneeId)
          const clientsInCompany = await copilot.getCompanyClients(task.assigneeId)
          const clientIds = clientsInCompany.map((client) => client.id)
          console.info('fetched client Ids', clientIds)
          recipientIds = clientIds
        }

        // this break is needed otherwise we will fallthrough to the IU case.
        // This is honestly unhinged JS behavior, I would not expect the
        // next case to run if the switch did not match it
        break
      case NotificationTaskActions.CommentToIU:
        // all internal users are potential parties in notifications for comments
        const getIUResponse = await copilot.getInternalUsers()
        if (task.assigneeType === AssigneeType.internalUser) {
          // when the assignee is an IU, we know that the all other IUs are involved
          // in notification
          recipientIds = getIUResponse.data.map((iu) => iu.id)
        } else {
          // when the assignee is not an IU, now we need to determine if IU has
          // access to the assignee of the task and filter the list of recipients
          let companyIdAssociatedWithTask = task.assigneeId
          if (task.assigneeType === AssigneeType.client) {
            // if the task is assigned to a company then we have the companyId to check for access
            if (task.assigneeId) {
              const taskClient = await copilot.getClient(task.assigneeId)
              companyIdAssociatedWithTask = taskClient.companyId
            }
          }
          recipientIds = getIUResponse.data
            .filter((iu) =>
              iu.isClientAccessLimited
                ? iu.companyAccessList?.includes(z.string().parse(companyIdAssociatedWithTask))
                : true,
            )
            .map((iu) => iu.id)
        }
      default:
        const userInfo = await copilot.me()
        senderId = z.string().parse(userInfo?.id)
        recipientId = z.string().parse(task.assigneeId)
        actionTrigger = userInfo as CopilotUser
        break
    }

    let actionUser = ''
    if (actionTrigger) {
      const excludeActions = [
        NotificationTaskActions.CompletedForCompanyByIU,
        NotificationTaskActions.CommentToCU,
        NotificationTaskActions.CommentToIU,
      ]
      actionUser =
        task.assigneeType === AssigneeType.company && !excludeActions.includes(action)
          ? (actionTrigger as CompanyResponse).name
          : `${(actionTrigger as CopilotUser).givenName} ${(actionTrigger as CopilotUser).familyName}`
    }

    return { senderId, recipientId, recipientIds, actionUser, companyName }
  }

  async getAllForTasks(tasks: Task[]): Promise<ClientNotification[]> {
    const taskIds = tasks.map((task) => task.id)
    return await this.db.clientNotification.findMany({ where: { taskId: { in: taskIds } } })
  }
}
