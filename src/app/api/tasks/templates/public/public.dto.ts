import { RFC3339DateSchema } from '@/types/common'
import { z } from 'zod'

/**
 * Schema for a public task template response.
 */
export const TemplateResponsePublicSchema = z.object({
  id: z.string().uuid(),
  object: z.literal('taskTemplate'),
  name: z.string(),
  description: z.string().nullable(),
  createdDate: RFC3339DateSchema,
})

export type TemplateResponsePublic = z.infer<typeof TemplateResponsePublicSchema>
