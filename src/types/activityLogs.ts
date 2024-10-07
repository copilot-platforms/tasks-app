import { ActivityType } from '@prisma/client'
import { z } from 'zod'

export const TaskCreatedDetailsSchema = z.object({
  dateTime: z.string().datetime(), // We could also use the activity log's createdAt but that would cause a small inconsistency
})
export type TaskCreatedDetails = z.infer<typeof TaskCreatedDetailsSchema>

export const DetailsSchemaMap: Partial<Record<ActivityType, any>> = {
  [ActivityType.TASK_CREATED]: TaskCreatedDetailsSchema,
}
type DetailsSchemaMapType = typeof DetailsSchemaMap

export type ValidActivityDetails = {
  [K in keyof DetailsSchemaMapType]: z.infer<DetailsSchemaMapType[K]>
}
