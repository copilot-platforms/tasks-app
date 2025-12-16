import { RFC3339DateSchema } from '@/types/common'
import { z } from 'zod'

export interface TemplateResponsePublicType {
  id: string
  object: 'taskTemplate'
  name: string
  description: string | null
  createdDate: string
  subTaskTemplates: TemplateResponsePublicType[]
} //forward declaring the interface

export const TemplateResponsePublicSchema: z.ZodType<TemplateResponsePublicType> = z.object({
  id: z.string().uuid(),
  object: z.literal('taskTemplate'),
  name: z.string(),
  description: z.string().nullable(),
  createdDate: RFC3339DateSchema,
  subTaskTemplates: z.array(z.lazy(() => TemplateResponsePublicSchema)),
})

export type TemplateResponsePublic = z.infer<typeof TemplateResponsePublicSchema>
