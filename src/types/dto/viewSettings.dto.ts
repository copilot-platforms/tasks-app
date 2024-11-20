import { ViewMode } from '@prisma/client'
import { z } from 'zod'

export const FilterOptionsSchema = z.object({
  assignee: z.string(),
  keyword: z.string(),
  type: z.string(),
})

export type FilterOptionsType = z.infer<typeof FilterOptionsSchema>

export const CreateViewSettingsSchema = z.object({
  viewMode: z.nativeEnum(ViewMode),
  filterOptions: FilterOptionsSchema,
  showUnarchived: z.boolean().optional(),
  showArchived: z.boolean().optional(),
})
export type CreateViewSettingsDTO = z.infer<typeof CreateViewSettingsSchema>
