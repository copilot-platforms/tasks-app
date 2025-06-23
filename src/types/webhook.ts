import { z } from 'zod'

export enum HANDLEABLE_EVENT {
  InternalUserDeleted = 'internalUser.deleted',
  ClientActivated = 'client.activated',
  ClientUpdated = 'client.updated',
  ClientDeleted = 'client.deleted',
  CompanyDeleted = 'company.deleted',
}

export enum DISPATCHABLE_EVENT {
  TaskCreated = 'task.created',
  TaskArchived = 'task.archived',
  TaskUpdated = 'task.updated',
  TaskCompleted = 'task.completed',
  TaskDeleted = 'task.deleted',
}

export const WebhookSchema = z.object({
  eventType: z.string(),
  created: z.string().optional(),
  object: z.string().optional(),
  data: z.unknown(),
})
export type WebhookEvent = z.infer<typeof WebhookSchema>

export const ClientUpdatedEventDataSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  previousAttributes: z.object({
    companyId: z.string().optional(),
  }),
})
export type ClientUpdatedEventData = z.infer<typeof ClientUpdatedEventDataSchema>

export const WebhookEntitySchema = z.object({
  id: z.string(),
})
