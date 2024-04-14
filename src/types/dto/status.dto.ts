import { z } from 'zod'

export const StatusTypeSchema = z.enum(['backlog', 'unstarted', 'started', 'completed', 'cancelled'])

export const CreateStatusRequestSchema = z.object({
  type: StatusTypeSchema,
  name: z.string(),
  color: z.string().optional(),
})
export type CreateStatusRequest = z.infer<typeof CreateStatusRequestSchema>
