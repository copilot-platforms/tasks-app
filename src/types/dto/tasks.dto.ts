import { AssigneeType as PrismaAssigneeType } from '@prisma/client'
import { z } from 'zod'

export const AssigneeTypeSchema = z.nativeEnum(PrismaAssigneeType).nullish()

export const CreateTaskRequestSchema = z.object({
  assigneeId: z.string().optional(),
  assigneeType: AssigneeTypeSchema,
  title: z.string(),
  body: z.string().optional(),
  workflowStateId: z.string().uuid(),
})
export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>

export const UpdateTaskRequestSchema = z.object({
  assigneeId: z.string().nullish(),
  assigneeType: AssigneeTypeSchema,
  title: z.string().optional(),
  body: z.string().nullish(),
  workflowStateId: z.string().uuid().optional(),
})
export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>
