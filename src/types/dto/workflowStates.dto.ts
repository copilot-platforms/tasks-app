import { z } from 'zod'

export const WorkflowStateTypeSchema = z.enum(['backlog', 'unstarted', 'started', 'completed', 'cancelled'])

export const CreateWorkflowStateRequestSchema = z.object({
  type: WorkflowStateTypeSchema,
  name: z.string(),
  color: z.string().optional(),
})
export type CreateWorkflowStateRequest = z.infer<typeof CreateWorkflowStateRequestSchema>

export const WorkflowStateResponseSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  type: WorkflowStateTypeSchema,
  name: z.string(),
  key: z.string(),
  color: z.string().optional(),
})
export type WorkflowStateResponse = z.infer<typeof WorkflowStateResponseSchema>
