import { z } from 'zod'

export const DuplicateNotificationsQuerySchema = z.object({
  taskId: z.string().uuid(),
  rowCount: z.bigint(),
  latestCreatedAt: z.date(),
})
