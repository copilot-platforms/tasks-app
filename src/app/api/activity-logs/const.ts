import {
  CommentAddedSchema,
  DueDateChangedSchema,
  TaskAssignedSchema,
  TaskCreatedSchema,
  TitleUpdatedSchema,
  WorkflowStateUpdatedSchema,
} from '@/app/api/activity-logs/schemas'
import { ArchivedStateUpdatedSchema } from '@/app/api/activity-logs/schemas/ArchiveStateUpdatedSchema'
import { ActivityType, AssigneeType } from '@prisma/client'
import { z } from 'zod'

export const SchemaByActivityType = {
  [ActivityType.TASK_CREATED]: TaskCreatedSchema,
  [ActivityType.TASK_ASSIGNED]: TaskAssignedSchema,
  [ActivityType.TITLE_UPDATED]: TitleUpdatedSchema,
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
