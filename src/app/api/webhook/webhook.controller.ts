import httpStatus from 'http-status'
import { NextRequest, NextResponse } from 'next/server'
import { WebhookDeletedEntitySchema, WebhookSchema } from '@/types/webhook'
import authenticate from '@api/core/utils/authenticate'
import APIError from '@api/core/exceptions/api'
import { AssigneeType } from '@prisma/client'

enum HANDLEABLE_EVENTS {
  InternalUserDeleted = 'internalUser.deleted',
  ClientDeleted = 'client.deleted',
  CompanyDeleted = 'company.deleted',
}

export const handleWebhookEvent = async (req: NextRequest) => {
  const user = await authenticate(req)

  const webhookEvent = WebhookSchema.safeParse(await req.json())
  if (!webhookEvent.success) {
    throw new APIError(httpStatus.UNPROCESSABLE_ENTITY, 'Failed to parse webhook event', webhookEvent.error.issues)
  }

  const eventType = webhookEvent.data.eventType as HANDLEABLE_EVENTS
  if (
    ![HANDLEABLE_EVENTS.InternalUserDeleted, HANDLEABLE_EVENTS.ClientDeleted, HANDLEABLE_EVENTS.CompanyDeleted].includes(
      eventType,
    )
  ) {
    return NextResponse.json({})
  }

  const deletedEntity = WebhookDeletedEntitySchema.parse(webhookEvent.data.data)
  const assigneeId = deletedEntity.id
  const assigneeType = {
    [HANDLEABLE_EVENTS.InternalUserDeleted]: AssigneeType.internalUser,
    [HANDLEABLE_EVENTS.ClientDeleted]: AssigneeType.client,
    [HANDLEABLE_EVENTS.CompanyDeleted]: AssigneeType.company,
  }[eventType]

  console.log(`${assigneeType} with id ${assigneeId} has been deleted. TODO: Delete all tasks associated with entity`)

  return NextResponse.json({ message: 'Webhook request handled successfully' })
}
