import { z } from 'zod'
import { AssigneeTypeSchema } from '@/types/dto/tasks.dto'

export const CreateTemplateRequestSchema = z.object({
  workflowStateId: z.string().uuid(),
  title: z.string(),
  body: z.string().nullish(),
})
export type CreateTemplateRequest = z.infer<typeof CreateTemplateRequestSchema>

export const UpdateTemplateRequestSchema = z.object({
  title: z.string().optional(),
  workflowStateId: z.string().uuid().optional(),
  body: z.string().nullish(),
})
export type UpdateTemplateRequest = z.infer<typeof UpdateTemplateRequestSchema>
