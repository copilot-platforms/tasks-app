import { z } from 'zod'

export const AssigneeTypeSchema = z.enum(['internalUser', 'client', 'company']).nullish()
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
  assigneeId: z.string().nullish(),
  assigneeType: AssigneeTypeSchema,
  title: z.string().optional(),
  body: z.string().optional(),
  workflowStateId: z.string().uuid().optional(),
})
export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>
