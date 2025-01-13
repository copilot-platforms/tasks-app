import { z } from 'zod'

export const WorkflowStateUpdatedSchema = z.object({
  // Old workflow state id
  oldValue: z.string().uuid(),
  // New workflow state id
  newValue: z.string().uuid(),
})
