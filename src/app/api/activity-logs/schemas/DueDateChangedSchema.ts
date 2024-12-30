import { DateStringSchema } from '@/types/date'
import { z } from 'zod'

export const DueDateChangedSchema = z.object({
  oldValue: DateStringSchema.nullish(),
  newValue: DateStringSchema.nullish(),
})
