import { ClientUpdatedEventData, HANDLEABLE_EVENT, WebhookEntitySchema, WebhookEvent, WebhookSchema } from '@/types/webhook'
import { BaseService } from '@api/core/services/base.service'
import { NextRequest } from 'next/server'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'
import { AssigneeType, StateType } from '@prisma/client'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { TasksService } from '@api/tasks/tasks.service'
import Bottleneck from 'bottleneck'
import { getInProductNotificationDetails } from '@api/notification/notification.helpers'
import { NotificationTaskActions } from '@api/core/types/tasks'
import { NotificationService } from '@api/notification/notification.service'
import User from '@api/core/models/User.model'
import { MAX_FETCH_ASSIGNEE_COUNT } from '@/constants/users'

// TODO: This will be broken for a while until OUT-1985
class WebhookService extends BaseService {
  private copilot
  constructor(user: User, customCopilotApiKey?: string) {
    super(user, customCopilotApiKey)
    this.copilot = new CopilotAPI(this.user.token)
  }

  async parseWebhook(req: NextRequest): Promise<WebhookEvent> {
    const webhookEvent = WebhookSchema.safeParse(await req.json())
    if (!webhookEvent.success) {
      throw new APIError(httpStatus.UNPROCESSABLE_ENTITY, 'Failed to parse webhook event', webhookEvent.error.issues)
    }
    return webhookEvent.data
  }

  validateHandleableEvent(webhookEvent: WebhookEvent): HANDLEABLE_EVENT | null {
    const eventType = webhookEvent.eventType as HANDLEABLE_EVENT
    const isValidWebhook = [
      HANDLEABLE_EVENT.InternalUserDeleted,
      HANDLEABLE_EVENT.ClientCreated,
      HANDLEABLE_EVENT.ClientUpdated,
      HANDLEABLE_EVENT.ClientDeleted,
      HANDLEABLE_EVENT.CompanyDeleted,
    ].includes(eventType)
    return isValidWebhook ? eventType : null
  }

  parseAssigneeData(webhookEvent: WebhookEvent, eventType: HANDLEABLE_EVENT) {
    const deletedEntity = WebhookEntitySchema.parse(webhookEvent.data)
    const assigneeId = deletedEntity.id
    const assigneeType = {
      [HANDLEABLE_EVENT.InternalUserDeleted]: AssigneeType.internalUser,
      [HANDLEABLE_EVENT.ClientCreated]: AssigneeType.client,
      [HANDLEABLE_EVENT.ClientUpdated]: AssigneeType.client,
      [HANDLEABLE_EVENT.ClientDeleted]: AssigneeType.client,
      [HANDLEABLE_EVENT.CompanyDeleted]: AssigneeType.company,
    }[eventType]

    return { assigneeId, assigneeType }
  }

  async handleClientCreated(assigneeId: string) {
    // First fetch all the current non-complete tasks for client's company, if exists
    const client = await this.copilot.getClient(assigneeId)
    let company
    try {
      // Accomodate indididual client's company id behavior for copilot
      company = await this.copilot.getCompany(client.companyId)
    } catch (e: unknown) {
      company = null
    }
    if (!company?.name) {
      // Client does not have a fixed company!
      return
    }

    const tasksService = new TasksService(this.user)
    const tasks = await tasksService.getIncompleteTasksForCompany(company.id)
    if (!tasks.length) return

    // Then trigger appropriate notifications
    const bottleneck = new Bottleneck({ minTime: 250, maxConcurrent: 2 })
    const createNotificationPromises = []

    const internalUsers = (await this.copilot.getInternalUsers({ limit: MAX_FETCH_ASSIGNEE_COUNT })).data
    const existingNotifications = await this.db.clientNotification.findMany({
      where: { clientId: assigneeId },
    })

    for (let task of tasks) {
      const actionUser = internalUsers.find((iu) => iu.id === task.createdById)
      if (!actionUser) {
        throw new APIError(
          httpStatus.INTERNAL_SERVER_ERROR,
          `webhookController :: could not get action user for company task ${task.id}`,
        )
      }

      const existingNotification = existingNotifications.find((notification) => notification.taskId === task.id)
      if (existingNotification) continue

      const actionUserName = `${actionUser.givenName} ${actionUser.familyName}`
      const inProduct = getInProductNotificationDetails(actionUserName, task, { companyName: company.name })[
        NotificationTaskActions.AssignedToCompany
      ]
      const notificationDetails = {
        senderId: task.createdById,
        recipientId: assigneeId,
        // If any of the given action is not present in details obj, that type of notification is not sent
        deliveryTargets: { inProduct },
      }
      createNotificationPromises.push(bottleneck.schedule(() => this.copilot.createNotification(notificationDetails)))
    }
    const notifications = await Promise.all(createNotificationPromises)

    // Now add appropriate records to our ClientNotifications table
    const insertBottleneck = new Bottleneck({ minTime: 100, maxConcurrent: 4 })
    const insertPromises = []
    const notificationService = new NotificationService(this.user)
    for (let i = 0; i < notifications.length; i++) {
      insertPromises.push(
        // This is assuming a 1:1 map for tasks and notifications
        insertBottleneck.schedule(() => notificationService.addToClientNotifications(tasks[i], notifications[i])),
      )
    }
    await Promise.all(insertPromises)
  }

  async handleUserDeleted(assigneeId: string, assigneeType: AssigneeType) {
    const tasksService = new TasksService(this.user)
    // Delete corresponding tasks
    console.info(`Deleting all tasks for ${assigneeType} ${assigneeId}`)
    const tasks = await tasksService.deleteAllAssigneeTasks(assigneeId, assigneeType)

    // Now delete any and all associated notifications triggered on behalf of company tasks for clients.
    // i.e. decrement client task count in CU portal
    if (assigneeType === AssigneeType.company) {
      const deletedTaskIds = tasks.map((task) => task.id)
      await this.handleDeletingTaskNotifications(deletedTaskIds)
    }
  }

  private async handleDeletingTaskNotifications(taskIds: string[]) {
    const clientTaskNotifications = await this.db.clientNotification.findMany({
      where: {
        taskId: { in: taskIds },
      },
    })

    const clientNotificationIds = clientTaskNotifications.map((notification) => notification.notificationId)
    if (clientNotificationIds.length) {
      await this.copilot.bulkMarkNotificationsAsRead(clientNotificationIds)
      await this.db.clientNotification.deleteMany({ where: { notificationId: { in: clientNotificationIds } } })
    }
  }

  async handleClientUpdated(data: ClientUpdatedEventData) {
    const {
      id: clientId,
      companyId: newCompanyId,
      previousAttributes: { companyId: prevCompanyId },
    } = data
    // If company hasn't been changed - don't bother with any of this
    if (prevCompanyId === newCompanyId || !prevCompanyId) return

    // Only delete prev notifications if client had a valid company before
    let prevCompany, newCompany
    try {
      prevCompany = await this.copilot.getCompany(prevCompanyId)
    } catch (e: unknown) {
      prevCompany = null
    }
    try {
      newCompany = await this.copilot.getCompany(newCompanyId)
    } catch (e: unknown) {
      newCompany = null
    }

    // Cases for company change - assignment / unassignment / reassignment
    if (!prevCompany?.name && newCompany?.name) {
      await this.handleCompanyAssignment(clientId)
    } else if (!newCompany?.name && prevCompany?.name) {
      await this.handleCompanyUnassignment(clientId, prevCompanyId)
    } else if (prevCompany?.name && newCompany?.name) {
      await this.handleCompanyUnassignment(clientId, prevCompanyId)
      await this.handleCompanyAssignment(clientId)
    } else {
      // This should never happen, still we want to be reported if this ever does
      throw new APIError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not identify company change')
    }
  }

  private async handleCompanyAssignment(clientId: string) {
    // Notifications logic is the same as when a new client is created
    await this.handleClientCreated(clientId)
  }

  private async handleCompanyUnassignment(clientId: string, prevCompanyId: string) {
    const company = await this.copilot.getCompany(prevCompanyId)

    // NOTE: If prev company was not a valid company, instead a randomly generated placeholder company,
    // prevCompany.name will be an empty string
    if (!company.name) {
      throw new APIError(httpStatus.INTERNAL_SERVER_ERROR, 'Cannot unassign from a company that does not exist')
    }

    // First find all tasks related to previous company
    const prevCompanyTasks = await this.db.task.findMany({
      where: {
        assigneeId: company.id,
        assigneeType: AssigneeType.company,
        workflowState: {
          type: { not: StateType.completed },
        },
      },
    })
    const prevCompanyTaskIds = prevCompanyTasks.map((task) => task.id)

    // Find all triggered notifications for this client, on behalf of prev company
    const prevCompanyNotifications = await this.db.clientNotification.findMany({
      where: {
        taskId: { in: prevCompanyTaskIds },
        clientId,
      },
    })
    const notificationIds = prevCompanyNotifications.map((notification) => notification.id)

    // Delete all task notifications triggered for client for previous company
    const deletePromises = []
    const bottleneck = new Bottleneck({ minTime: 250, maxConcurrent: 2 })

    for (let notification of prevCompanyNotifications) {
      deletePromises.push(
        bottleneck.schedule(() => {
          return this.copilot.markNotificationAsRead(notification.notificationId)
        }),
      )
    }
    await Promise.all(deletePromises)
    await this.db.clientNotification.deleteMany({ where: { id: { in: notificationIds } } })
  }
}

export default WebhookService
