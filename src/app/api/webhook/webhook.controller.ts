import { ClientUpdatedEventDataSchema, HANDLEABLE_EVENT } from '@/types/webhook'
import authenticate from '@api/core/utils/authenticate'
import WebhookService from '@api/webhook/webhook.service'
import { NextRequest, NextResponse } from 'next/server'

export const handleWebhookEvent = async (req: NextRequest) => {
  const user = await authenticate(req)

  const webhookService = new WebhookService(user)
  const webhookEvent = await webhookService.parseWebhook(req)

  console.info(`Handling webhook event ${webhookEvent.eventType} with data`, webhookEvent.data)
  const eventType = webhookService.validateHandleableEvent(webhookEvent)
  if (!eventType) {
    return NextResponse.json({})
  }
  const { assigneeId, assigneeType } = webhookService.parseAssigneeData(webhookEvent, eventType)

  switch (eventType) {
    // The reason we handle notifications on client.activated, not client.created, is because there might be a time
    // offset between the creation and activation of the client.
    // Any notifications dispatched / deleted in this time period will not be synced to this not-yet activated client!
    // See: https://linear.app/copilotplatforms/issue/OUT-1927/cu-can-see-the-in-product-notification-for-a-completed-company-task
    case HANDLEABLE_EVENT.ClientActivated:
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
