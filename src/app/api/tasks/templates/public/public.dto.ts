import { RFC3339DateSchema } from '@/types/common'
import { z } from 'zod'

export const TemplateResponsePublicSchema = z.object({
  id: z.string().uuid(),
  object: z.string(),
  name: z.string(),
  description: z.string(),
  createdDate: RFC3339DateSchema,
})

export type TemplateResponsePublic = z.infer<typeof TemplateResponsePublicSchema>
