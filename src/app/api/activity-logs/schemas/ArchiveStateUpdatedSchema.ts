import { z } from 'zod'

export const ArchivedStateUpdatedSchema = z.object({
  oldValue: z.boolean(),
  newValue: z.boolean(),
})
