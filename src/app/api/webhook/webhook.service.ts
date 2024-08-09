import { HANDLEABLE_EVENT, WebhookEntitySchema, WebhookEvent, WebhookSchema } from '@/types/webhook'
import { BaseService } from '@api/core/services/base.service'
import { NextRequest } from 'next/server'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'
import { AssigneeType } from '@prisma/client'

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
      [HANDLEABLE_EVENT.ClientDeleted]: AssigneeType.client,
      [HANDLEABLE_EVENT.CompanyDeleted]: AssigneeType.company,
    }[eventType]

    return { assigneeId, assigneeType }
  }
}

export default WebhookService
