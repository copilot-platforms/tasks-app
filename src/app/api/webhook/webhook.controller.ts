import { NextRequest, NextResponse } from 'next/server'
import authenticate from '@api/core/utils/authenticate'
import WebhookService from '@api/webhook/webhook.service'

export const handleWebhookEvent = async (req: NextRequest) => {
  const user = await authenticate(req)

  const webhookService = new WebhookService(user)
  const webhookEvent = await webhookService.parseWebhook(req)

  const eventType = webhookService.validateHandleableEvent(webhookEvent)
  if (!eventType) {
    return NextResponse.json({})
  }
  const { assigneeId, assigneeType } = webhookService.parseAssigneeData(webhookEvent, eventType)

  console.log(`${assigneeType} with id ${assigneeId} has been deleted. TODO: Delete all tasks associated with entity`)

  return NextResponse.json({ message: 'Webhook request handled successfully' })
}
