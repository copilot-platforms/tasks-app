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

class WebhookService extends BaseService {
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
    const copilot = new CopilotAPI(this.user.token)
    const client = await copilot.getClient(assigneeId)
    const company = await copilot.getCompany(client.companyId)
    if (company.name === '') {
      // Client does not have a fixed company!
      return
    }

    const tasksService = new TasksService(this.user)
    const tasks = await tasksService.getIncompleteTasksForCompany(company.id)
    if (!tasks.length) return

    // Then trigger appropriate notifications
    const bottleneck = new Bottleneck({ minTime: 250, maxConcurrent: 2 })
    const createNotificationPromises = []

    const internalUsers = (await copilot.getInternalUsers()).data

    for (let task of tasks) {
      const actionUser = internalUsers.find((iu) => iu.id === task.createdById)
      if (!actionUser) {
        throw new APIError(
          httpStatus.INTERNAL_SERVER_ERROR,
          `webhookController :: could not get action user for company task ${task.id}`,
        )
      }

      const actionUserName = `${actionUser.givenName} ${actionUser.familyName}`
      const inProduct = getInProductNotificationDetails(actionUserName, task, company.name)[
        NotificationTaskActions.AssignedToCompany
      ]
      const notificationDetails = {
        senderId: task.createdById,
        recipientId: assigneeId,
        // If any of the given action is not present in details obj, that type of notification is not sent
        deliveryTargets: { inProduct },
      }
      createNotificationPromises.push(bottleneck.schedule(() => copilot.createNotification(notificationDetails)))
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
    await tasksService.deleteAllAssigneeTasks(assigneeId, assigneeType)

    // Delete corresponding notifications
    const notificationService = new NotificationService(this.user)
    await notificationService.readAllUserNotifications(assigneeId, assigneeType)
  }

  async handleClientUpdated(data: ClientUpdatedEventData) {
    const {
      id: clientId,
      companyId: newCompanyId,
      previousAttributes: { companyId: prevCompanyId },
    } = data
    // If company hasn't been changed - don't bother with any of this
    if (!prevCompanyId) return

    // First find all tasks related to previous company
    const prevCompanyTasks = await this.db.task.findMany({
      where: {
        assigneeId: prevCompanyId,
        assigneeType: AssigneeType.company,
        workflowState: {
          type: { not: StateType.completed },
        },
      },
    })
    // NOTE: workspaceId filter is not used because:
    // (i) Webhook request doesn't provide workspaceId
    // (ii) Company is not shared across workspaces
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
    const copilot = new CopilotAPI(this.user.token)
    const bottleneck = new Bottleneck({ minTime: 250, maxConcurrent: 2 })

    for (let notification of prevCompanyNotifications) {
      deletePromises.push(
        bottleneck.schedule(() => {
          return copilot.markNotificationAsRead(notification.notificationId)
        }),
      )
    }
    await Promise.all(deletePromises)
    await this.db.clientNotification.deleteMany({ where: { id: { in: notificationIds } } })

    // Trigger new notifications for new company's tasks (if exists)
    if (!newCompanyId) return
    await this.handleClientCreated(clientId)
  }
}

export default WebhookService
