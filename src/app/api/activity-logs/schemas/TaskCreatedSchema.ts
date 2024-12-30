import { z } from 'zod'
import { AssigneeType } from '@prisma/client'

export const TaskCreatedSchema = z.object({
  taskId: z.string(),
})
