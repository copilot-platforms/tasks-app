import { z } from 'zod'

export const TaskAssignedSchema = z.object({
  id: z.string(),
  oldAssigneeId: z.string().uuid(),
  newAssigneeId: z.string().uuid(),
})
