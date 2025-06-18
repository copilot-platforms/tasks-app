import { UserIdsSchema } from '@/utils/assignee'
import { ViewMode } from '@prisma/client'
import { z } from 'zod'

export const FilterOptionsSchema = z.object({
  assignee: UserIdsSchema,
  keyword: z.string(),
  type: z.string(),
})

export const ArchivedOptionsSchema = z.object({
  showArchived: z.boolean().optional(),
  showUnarchived: z.boolean().optional(),
})

export type FilterOptionsType = z.infer<typeof FilterOptionsSchema>

export type ArchivedOptionsType = z.infer<typeof ArchivedOptionsSchema>

export const CreateViewSettingsSchema = z.object({
  viewMode: z.nativeEnum(ViewMode),
  filterOptions: FilterOptionsSchema,
  showUnarchived: z.boolean().optional(),
  showArchived: z.boolean().optional(),
})
export type CreateViewSettingsDTO = z.infer<typeof CreateViewSettingsSchema>
