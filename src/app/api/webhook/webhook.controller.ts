import { NextRequest, NextResponse } from 'next/server'
import authenticate from '@api/core/utils/authenticate'
import WebhookService from '@api/webhook/webhook.service'
import { TasksService } from '@api/tasks/tasks.service'
import { NotificationService } from '@api/notification/notification.service'
import { HANDLEABLE_EVENT } from '@/types/webhook'
import Bottleneck from 'bottleneck'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { getInProductNotificationDetails } from '../notification/notification.helpers'
import { NotificationTaskActions } from '../core/types/tasks'
import APIError from '../core/exceptions/api'
import httpStatus from 'http-status'

export const handleWebhookEvent = async (req: NextRequest) => {
  const user = await authenticate(req)

  const webhookService = new WebhookService(user)
  const webhookEvent = await webhookService.parseWebhook(req)

  const eventType = webhookService.validateHandleableEvent(webhookEvent)
  if (!eventType) {
    return NextResponse.json({})
  }
  const { assigneeId, assigneeType } = webhookService.parseAssigneeData(webhookEvent, eventType)

  const tasksService = new TasksService(user)

  if (eventType === HANDLEABLE_EVENT.ClientCreated) {
    // First fetch all the current non-complete tasks for client's company, if exists
    const copilot = new CopilotAPI(user.token)
    const client = await copilot.getClient(assigneeId)
    const company = await copilot.getCompany(client.companyId)
    if (company.name === '') {
      // Client does not have a fixed company!
      return NextResponse.json({})
    }

    const tasks = await tasksService.getUnfilteredTasksForUser(company.id)
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
      console.log('inProduct', inProduct)
      console.log('recip', assigneeId)
      createNotificationPromises.push(bottleneck.schedule(() => copilot.createNotification(notificationDetails)))
    }

    await Promise.all(createNotificationPromises)
    return NextResponse.json({ message: 'client.created webhook handled successfully' })
  }

  // Delete corresponding tasks
  console.info(`Deleting all tasks for ${assigneeType} ${assigneeId}`)
  await tasksService.deleteAllAssigneeTasks(assigneeId, assigneeType)

  // Delete corresponding notifications
  const notificationService = new NotificationService(user)
  await notificationService.readAllUserNotifications(assigneeId, assigneeType)

  return NextResponse.json({ message: 'Webhook request handled successfully' })
}
