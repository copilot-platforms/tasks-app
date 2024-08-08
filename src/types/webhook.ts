import { z } from 'zod'

export const WebhookSchema = z.object({
  eventType: z.string(),
  created: z.string().optional(),
  object: z.string().optional(),
  data: z.unknown(),
})

export const WebhookDeletedEntitySchema = z.object({
  id: z.string(),
})
