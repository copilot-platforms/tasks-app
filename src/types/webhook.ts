import { z } from 'zod'

export enum HANDLEABLE_EVENT {
  InternalUserDeleted = 'internalUser.deleted',
  ClientCreated = 'client.created',
  ClientDeleted = 'client.deleted',
  CompanyDeleted = 'company.deleted',
}

export const WebhookSchema = z.object({
  eventType: z.string(),
  created: z.string().optional(),
  object: z.string().optional(),
  data: z.unknown(),
})
export type WebhookEvent = z.infer<typeof WebhookSchema>

export const WebhookEntitySchema = z.object({
  id: z.string(),
})
