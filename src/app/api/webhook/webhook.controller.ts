import { NextRequest, NextResponse } from 'next/server'
import authenticate from '@api/core/utils/authenticate'
import WebhookService from '@api/webhook/webhook.service'
import { TasksService } from '@api/tasks/tasks.service'
import { NotificationService } from '@api/notification/notification.service'

export const handleWebhookEvent = async (req: NextRequest) => {
  const user = await authenticate(req)

  const webhookService = new WebhookService(user)
  const webhookEvent = await webhookService.parseWebhook(req)

  const eventType = webhookService.validateHandleableEvent(webhookEvent)
  if (!eventType) {
    return NextResponse.json({})
  }
  const { assigneeId, assigneeType } = webhookService.parseAssigneeData(webhookEvent, eventType)

  // Delete corresponding tasks
  const tasksService = new TasksService(user)
  console.info(`Deleting all tasks for ${assigneeType} ${assigneeId}`)
  await tasksService.deleteAllAssigneeTasks(assigneeId, assigneeType)

  // Delete corresponding notifications
  const notificationService = new NotificationService(user)
  await notificationService.readAllUserNotifications(assigneeId, assigneeType)

  return NextResponse.json({ message: 'Webhook request handled successfully' })
}
