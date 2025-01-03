import { z } from 'zod'

export const TaskCreatedSchema = z.object({
  taskId: z.string(),
})
