import { z } from 'zod'
import { WorkflowStateResponseSchema } from './workflowStates.dto'

export const AssigneeTypeSchema = z.enum(['internalUser', 'client', 'company']).optional()
export type AssigneeType = z.infer<typeof AssigneeTypeSchema>

export const CreateTaskRequestSchema = z.object({
  assigneeId: z.string().optional(),
  assigneeType: AssigneeTypeSchema,
  title: z.string(),
  body: z.string().optional(),
  workflowStateId: z.string().uuid(),
})
export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>

export const UpdateTaskRequestSchema = z.object({
  assigneeId: z.string().optional(),
  assigneeType: AssigneeTypeSchema,
  title: z.string().optional(),
  body: z.string().optional(),
  workflowStateId: z.string().uuid().optional(),
})
export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>

export const TaskResponseSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  assigneeId: z.string().optional(),
  assigneeType: AssigneeTypeSchema,
  title: z.string().optional(),
  body: z.string().optional(),
  createdBy: z.string(),
  workflowStateId: z.string().uuid().optional(),
  workflowState: WorkflowStateResponseSchema,
})

export type TaskResponse = z.infer<typeof TaskResponseSchema>
