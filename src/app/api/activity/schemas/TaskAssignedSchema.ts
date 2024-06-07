import { z } from 'zod'

export const TaskAssignedSchema = z.object({
  oldAssigneeId: z.string().uuid(),
  newAssigneeId: z.string().uuid(),
})
