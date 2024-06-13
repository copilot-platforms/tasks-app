import { z } from 'zod'
import { ActivityType, AssigneeType } from '@prisma/client'
import { DBActivityLogDetailsSchema } from '@api/activity-logs/const'

export const LogResponseSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(ActivityType),
  details: DBActivityLogDetailsSchema,
  taskId: z.string().uuid(),
  userId: z.string().uuid(),
  userRole: z.nativeEnum(AssigneeType),
  workspaceId: z.string(),
  initiator: z.unknown(),
  createdAt: z.string().datetime(),
})

export const LogResponseSchemaArrayType = z.array(LogResponseSchema)

export type LogResponse = z.infer<typeof LogResponseSchema>
