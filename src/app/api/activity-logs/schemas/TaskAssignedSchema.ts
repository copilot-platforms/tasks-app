import { AssigneeType } from '@prisma/client'
import { z } from 'zod'

export const TaskAssignedSchema = z.object({
  oldAssigneeId: z.string().uuid().nullable(),
  newAssigneeId: z.string().uuid().nullable(),
  assigneeType: z.nativeEnum(AssigneeType).nullable(),
})

export const TaskAssignedResponseSchema = z.object({
  oldAssigneeId: z.string().uuid().nullable(),
  newAssigneeId: z.string().uuid().nullable(),
  assigneeType: z.nativeEnum(AssigneeType).nullable(),
  newAssigneeDetails: z.object({
    givenName: z.string().optional(),
    familyName: z.string().optional(),
    name: z.string().optional(),
  }),
})

export type TaskAssignedResponse = z.infer<typeof TaskAssignedResponseSchema>
