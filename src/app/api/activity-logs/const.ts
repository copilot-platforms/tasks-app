import { ActivityType, AssigneeType } from '@prisma/client'
import { TaskCreatedSchema } from '@api/activity-logs/schemas/TaskCreatedSchema'
import { TaskAssignedSchema } from '@api/activity-logs/schemas/TaskAssignedSchema'
import { WorkflowStateUpdatedSchema } from '@api/activity-logs/schemas/WorkflowStateUpdatedSchema'
import { CommentAddedSchema } from '@api/activity-logs/schemas/CommentAddedSchema'
import { z } from 'zod'
import { ArchivedStateUpdatedSchema } from '@/app/api/activity-logs/schemas/ArchiveStateUpdatedSchema'
import { DueDateChangedSchema } from '@/app/api/activity-logs/schemas/DueDateChangedSchema'

export const SchemaByActivityType = {
  [ActivityType.TASK_CREATED]: TaskCreatedSchema,
  [ActivityType.TASK_ASSIGNED]: TaskAssignedSchema,
  [ActivityType.WORKFLOW_STATE_UPDATED]: WorkflowStateUpdatedSchema,
  [ActivityType.COMMENT_ADDED]: CommentAddedSchema,
  [ActivityType.DUE_DATE_CHANGED]: DueDateChangedSchema,
  [ActivityType.ARCHIVE_STATE_UPDATED]: ArchivedStateUpdatedSchema,
}

export const DBActivityLogDetailsSchema = z.record(z.string(), z.unknown())
export type DBActivityLogDetails = z.infer<typeof DBActivityLogDetailsSchema>
export const DBActivityLogSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(ActivityType),
  details: DBActivityLogDetailsSchema,
  taskId: z.string().uuid(),
  userId: z.string().uuid(),
  userRole: z.nativeEnum(AssigneeType),
  workspaceId: z.string(),
  createdAt: z.date(),
})

export const DBActivityLogArraySchema = z.array(DBActivityLogSchema)
