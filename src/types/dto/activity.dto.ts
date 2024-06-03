import { z } from 'zod'
import { UpdateTaskRequestSchema } from './tasks.dto'
import { UserRole } from '@/app/api/core/types/user'
import { ActivityType, WorkflowState } from '@prisma/client'
import { WorkspaceResponseSchema } from '../common'
import { CommentResponseSchema } from './comment.dto'

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
  initiator: z.string(),
  initiatorId: z.string().uuid(),
})

export const Activity_WorkflowState_UpdateSchema = z.object({
  initiator: z.string(),
  initiatorId: z.string().uuid(),
  prevWorkflowState: WorkspaceResponseSchema,
  currentWorkflowState: WorkspaceResponseSchema,
})

export const Activity_AssignTaskSchema = z.object({
  initiator: z.string(),
  initiatorId: z.string().uuid(),
  assignedTo: z.string(),
  assignedToId: z.string().uuid(),
})

export const ActivityLogResponseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date().default(() => new Date()),
  taskId: z.string().uuid(),
  workspaceId: z.string(),
  activityType: z.nativeEnum(ActivityType),
  details: z.union([Activity_CreateTaskSchema, Activity_WorkflowState_UpdateSchema, Activity_AssignTaskSchema]),
  deletedAt: z.date().nullable(),
})

export const LogSchema = z.array(z.union([ActivityLogResponseSchema, CommentResponseSchema]))
