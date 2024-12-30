import { AssigneeType } from '@prisma/client'
import { z } from 'zod'

export const TaskAssignedSchema = z.object({
  oldValue: z.string().uuid().nullable(),
  newValue: z.string().uuid().nullable(),
})

export const TaskAssignedResponseSchema = z.object({
  oldValue: z.string().uuid().nullable(),
  newValue: z.string().uuid().nullable(),
})

export type TaskAssignedResponse = z.infer<typeof TaskAssignedResponseSchema>
