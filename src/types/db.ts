import { z } from 'zod'

export const BaseNotificationDataSchema = z.object({
  notificationId: z.string(),
  taskId: z.string(),
})

export const InternalUserNotificationDataSchema = BaseNotificationDataSchema.extend({
  internalUserId: z.string().uuid(),
})
export const ClientNotificationDataSchema = BaseNotificationDataSchema.extend({
  clientId: z.string().uuid(),
})
