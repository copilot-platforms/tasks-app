import { ActivityType } from '@prisma/client'
import { TaskCreatedSchema } from '@api/activity-logs/schemas/TaskCreatedSchema'
import { TaskAssignedSchema } from '@api/activity-logs/schemas/TaskAssignedSchema'
import { WorkflowStateUpdatedSchema } from '@api/activity-logs/schemas/WorkflowStateUpdatedSchema'
import { CommentAddedSchema } from '@api/activity-logs/schemas/CommentAddedSchema'
import { z } from 'zod'

export const SchemaByActivityType = {
  [ActivityType.TASK_CREATED]: TaskCreatedSchema,
  [ActivityType.TASK_ASSIGNED]: TaskAssignedSchema,
  [ActivityType.WORKFLOW_STATE_UPDATED]: WorkflowStateUpdatedSchema,
  [ActivityType.COMMENT_ADDED]: CommentAddedSchema,
}

export const DBActivityLogDetailsSchema = z.record(z.string(), z.unknown())
export type DBActivityLogDetails = z.infer<typeof DBActivityLogDetailsSchema>
export const DBActivityLogSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(ActivityType),
  details: DBActivityLogDetailsSchema,
  taskId: z.string().uuid(),
  userId: z.string().uuid(),
  workspaceId: z.string(),
  createdAt: z.date(),
})

export const DBActivityLogArraySchema = z.array(DBActivityLogSchema)
