import { AssigneeType } from '@prisma/client'
import { z } from 'zod'

export const TaskAssignedSchema = z.object({
  oldAssigneeId: z.string().uuid().nullable(),
  newAssigneeId: z.string().uuid().nullable(),
  assigneeType: z.nativeEnum(AssigneeType).nullable(),
})
