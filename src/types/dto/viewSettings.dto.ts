import { z } from 'zod'

export const CreateViewSettingsSchema = z.object({
  viewMode: z.enum(['board', 'list']).optional(),
})
export type CreateViewSettingsDTO = z.infer<typeof CreateViewSettingsSchema>
