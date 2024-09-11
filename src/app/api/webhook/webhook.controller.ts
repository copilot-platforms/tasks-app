import { NextRequest, NextResponse } from 'next/server'
import authenticate from '@api/core/utils/authenticate'
import WebhookService from '@api/webhook/webhook.service'
import { ClientUpdatedEventDataSchema, HANDLEABLE_EVENT } from '@/types/webhook'

export const handleWebhookEvent = async (req: NextRequest) => {
  const user = await authenticate(req)

  const webhookService = new WebhookService(user)
  const webhookEvent = await webhookService.parseWebhook(req)

  console.info(
    `Handling webhook event ${webhookEvent.eventType} for workspace ${user.workspaceId} with data`,
    webhookEvent.data,
  )
  const eventType = webhookService.validateHandleableEvent(webhookEvent)
  if (!eventType) {
    return NextResponse.json({})
  }
  const { assigneeId, assigneeType } = webhookService.parseAssigneeData(webhookEvent, eventType)

  switch (eventType) {
    case HANDLEABLE_EVENT.ClientCreated:
      await webhookService.handleClientCreated(assigneeId)
      break
    case HANDLEABLE_EVENT.ClientUpdated:
      await webhookService.handleClientUpdated(ClientUpdatedEventDataSchema.parse(webhookEvent.data))
      break
    default:
      await webhookService.handleUserDeleted(assigneeId, assigneeType)
  }

  return NextResponse.json({ message: `${eventType} webhook request handled successfully` })
}
