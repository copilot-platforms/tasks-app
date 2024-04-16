import { z } from 'zod'

export const CreateTaskRequestSchema = z.object({
  assigneeId: z.string().optional(),
  assigneeType: z.enum(['iu', 'client', 'company']).optional(),
  title: z.string(),
  body: z.string().optional(),
  workflowStateId: z.string().uuid(),
})
export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>

export const UpdateTaskRequestSchema = z.object({
  assigneeId: z.string().optional(),
  assigneeType: z.enum(['iu', 'client', 'company']).optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  workflowStateId: z.string().uuid().optional(),
})
export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>
