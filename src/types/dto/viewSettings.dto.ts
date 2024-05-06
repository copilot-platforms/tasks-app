import { ViewMode } from '@prisma/client'
import { z } from 'zod'

export const CreateViewSettingsSchema = z.object({
  viewMode: z.nativeEnum(ViewMode).optional(),
})
export type CreateViewSettingsDTO = z.infer<typeof CreateViewSettingsSchema>
