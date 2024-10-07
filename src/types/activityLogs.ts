import { z } from 'zod'

export const TaskCreatedDetailsSchema = z.object({
  dateTime: z.string().datetime(), // We could also use the activity log's createdAt but that would cause a small inconsistency
})
export type TaskCreatedDetails = z.infer<typeof TaskCreatedDetailsSchema>

// Eventually add more details types here
export type ValidActivityDetails = TaskCreatedDetails
