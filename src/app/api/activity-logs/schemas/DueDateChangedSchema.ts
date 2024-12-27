import { z } from 'zod'

export const DueDateChangedSchema = z.object({
  oldValue: z.string().nullish(),
  newValue: z.string().nullish(),
})
