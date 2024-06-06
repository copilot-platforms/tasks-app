import { z } from 'zod'
import { AssigneeType } from '@prisma/client'

export const TaskCreatedSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  assigneeId: z.string().uuid(),
  assigneeType: z.nativeEnum(AssigneeType),
  title: z.string(),
  body: z.string(),
  dueDate: z.string().datetime(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime(),
})
