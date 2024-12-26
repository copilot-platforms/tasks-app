import { AssigneeType } from '@prisma/client'
import { z } from 'zod'

export const TaskAssignedSchema = z.object({
  assigneeId: z.string().uuid().nullable(),
})

export const TaskAssignedResponseSchema = z.object({
  assigneeId: z.string().uuid().nullable(),
})

export type TaskAssignedResponse = z.infer<typeof TaskAssignedResponseSchema>
