import { z } from 'zod'

export const TitleUpdatedSchema = z.object({
  oldValue: z.string(),
  newValue: z.string(),
})
