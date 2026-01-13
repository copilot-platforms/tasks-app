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

export const SubTemplateResponsePublicSchema = z.object({
  id: z.string().uuid(),
  object: z.literal('taskTemplate'),
  name: z.string(),
  description: z.string().nullable(),
  createdDate: RFC3339DateSchema,
})

export const TemplateResponsePublicSchema = z.object({
  id: z.string().uuid(),
  object: z.literal('taskTemplate'),
  name: z.string(),
  description: z.string().nullable(),
  createdDate: RFC3339DateSchema,
  subTaskTemplates: z.array(SubTemplateResponsePublicSchema),
})

export type SubTemplateResponsePublic = z.infer<typeof SubTemplateResponsePublicSchema>

export type TemplateResponsePublic = z.infer<typeof TemplateResponsePublicSchema>
