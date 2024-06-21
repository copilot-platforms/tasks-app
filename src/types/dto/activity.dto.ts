import { z } from 'zod'
import { UpdateTaskRequestSchema } from '@/types/dto/tasks.dto'
import { UserRole } from '@/app/api/core/types/user'
import { ActivityType } from '@prisma/client'
import { WorkflowStateResponseSchema } from '@/types/dto/workflowStates.dto'
import { CommentResponseSchema } from '@/types/dto/comment.dto'

export const UserSchema = z.object({
  token: z.string(),
  role: z.nativeEnum(UserRole),
  workspaceId: z.string(),
  clientId: z.string().optional(),
  companyId: z.string().optional(),
  internalUserId: z.string().optional(),
})

export const CreateActivitySchema = z.object({
  user: UserSchema,
  task: UpdateTaskRequestSchema,
})

export const Activity_CreateTaskSchema = z.object({
  type: z.literal(ActivityType.TASK_CREATED),
  initiator: z.string(),
  initiatorId: z.string().uuid(),
})

export const Activity_WorkflowState_UpdateSchema = z.object({
  type: z.literal(ActivityType.WORKFLOW_STATE_UPDATED),
  initiator: z.string(),
  initiatorId: z.string().uuid(),
  prevWorkflowState: WorkflowStateResponseSchema,
  currentWorkflowState: WorkflowStateResponseSchema,
})

export const Activity_AssignTaskSchema = z.object({
  type: z.literal(ActivityType.TASK_ASSIGNED),
  initiator: z.string(),
  initiatorId: z.string().uuid(),
  assignedTo: z.string(),
  assignedToId: z.string().uuid(),
})

export const ActivityLogResponseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date().default(() => new Date()),
  activityType: z.nativeEnum(ActivityType),
  details: z.discriminatedUnion('type', [
    Activity_CreateTaskSchema,
    Activity_WorkflowState_UpdateSchema,
    Activity_AssignTaskSchema,
  ]),
})

export type ActivityLogResponse = z.infer<typeof ActivityLogResponseSchema>

export const LogResponseSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  workspaceId: z.string(),
  activityLog: ActivityLogResponseSchema.nullable(),
  comment: CommentResponseSchema.nullable(),
  createdAt: z.date().default(() => new Date()),
})
