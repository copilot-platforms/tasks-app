import { z } from 'zod'

export const ViewerAddedSchema = z.object({
  oldValue: z.string().uuid().nullable(),
  newValue: z.string().uuid().nullable(),
})

export const ViewerRemovedSchema = z.object({
  oldValue: z.string().uuid().nullable(),
  newValue: z.null(),
})
