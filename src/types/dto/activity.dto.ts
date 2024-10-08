import { ActivityLogSchema } from '@/types/activityLogs'
import { z } from 'zod'

export const ActivityLogsResponseSchema = z.object({ data: z.array(ActivityLogSchema) })

export type ActivityLogsResponse = z.infer<typeof ActivityLogsResponseSchema>
