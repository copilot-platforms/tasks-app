import { z } from 'zod'
import { AssigneeTypeSchema } from '@/types/dto/tasks.dto'

export const CreateTemplateRequestSchema = z.object({
  templateName: z.string(),
  title: z.string(),
  body: z.string().nullish(),
  workflowStateId: z.string().uuid(),
  assigneeId: z.string().nullish(),
  assigneeType: AssigneeTypeSchema,
})
export type CreateTemplateRequest = z.infer<typeof CreateTemplateRequestSchema>

export const UpdateTemplateRequestSchema = z.object({
  templateName: z.string().optional(),
  title: z.string().optional(),
  body: z.string().nullish(),
  workflowStateId: z.string().uuid().optional(),
  assigneeId: z.string().nullish(),
  assigneeType: AssigneeTypeSchema,
})
export type UpdateTemplateRequest = z.infer<typeof UpdateTemplateRequestSchema>
