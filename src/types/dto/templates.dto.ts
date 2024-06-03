import { z } from 'zod'
import { AssigneeTypeSchema } from '@/types/dto/tasks.dto'

export const CreateTemplateRequestSchema = z.object({
  templateName: z.string(),
  title: z.string(),
  body: z.string().nullish(),
})
export type CreateTemplateRequest = z.infer<typeof CreateTemplateRequestSchema>

export const UpdateTemplateRequestSchema = z.object({
  templateName: z.string().optional(),
  title: z.string().optional(),
  body: z.string().nullish(),
})
export type UpdateTemplateRequest = z.infer<typeof UpdateTemplateRequestSchema>
