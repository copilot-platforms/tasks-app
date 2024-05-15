import { AssigneeType as PrismaAssigneeType } from '@prisma/client'
import { z } from 'zod'
import { WorkflowStateResponseSchema } from './workflowStates.dto'

export const AssigneeTypeSchema = z.nativeEnum(PrismaAssigneeType).nullish()
export type AssigneeType = z.infer<typeof AssigneeTypeSchema>

// Schema for validating ISO 8601 date strings
const isoDateSchema = z
  .string()
  .refine(
    (data) => {
      return !isNaN(Date.parse(data))
    },
    {
      message: 'Invalid date format, expected ISO 8601 string',
    },
  )
  .transform((data) => new Date(data))

export const CreateTaskRequestSchema = z.object({
  assigneeId: z.string().optional(),
  assigneeType: AssigneeTypeSchema,
  title: z.string(),
  body: z.string().optional(),
  workflowStateId: z.string().uuid(),
  dueDate: isoDateSchema.optional(),
})
export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>

export const UpdateTaskRequestSchema = z.object({
  assigneeId: z.string().nullish(),
  assigneeType: AssigneeTypeSchema,
  title: z.string().optional(),
  body: z.string().nullish(),
  workflowStateId: z.string().uuid().optional(),
  dueDate: isoDateSchema.optional(),
})
export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>

export const TaskResponseSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  assigneeId: z.string().optional(),
  assigneeType: AssigneeTypeSchema,
  title: z.string().optional(),
  body: z.string().optional(),
  createdById: z.string(),
  workflowStateId: z.string().uuid().optional(),
  workflowState: WorkflowStateResponseSchema,
  dueDate: isoDateSchema.optional(),
})

export type TaskResponse = z.infer<typeof TaskResponseSchema>
