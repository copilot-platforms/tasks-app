import { z } from 'zod'
import { AssigneeType } from '@prisma/client'

export const TaskCreatedSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  assigneeId: z.string().uuid().nullable(),
  assigneeType: z.nativeEnum(AssigneeType).nullable(),
  title: z.string(),
  body: z.string().nullable(),
  dueDate: z.string().datetime().nullish(),
})
