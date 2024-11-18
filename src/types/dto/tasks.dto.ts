import { AssigneeType as PrismaAssigneeType } from '@prisma/client'
import { z } from 'zod'
import { WorkflowStateResponseSchema } from './workflowStates.dto'
import { DateStringSchema } from '@/types/date'
import { ClientResponseSchema, CompanyResponseSchema, InternalUsersSchema } from '../common'

export const AssigneeTypeSchema = z.nativeEnum(PrismaAssigneeType).nullish()
export type AssigneeType = z.infer<typeof AssigneeTypeSchema>

export const CreateTaskRequestSchema = z.object({
  assigneeId: z.string().optional().nullish(),
  assigneeType: AssigneeTypeSchema,
  title: z.string().min(1),
  body: z.string().optional(),
  workflowStateId: z.string().uuid(),
  dueDate: DateStringSchema.nullish(),
})
export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>

export const UpdateTaskRequestSchema = z.object({
  assigneeId: z.string().nullish(),
  assigneeType: AssigneeTypeSchema,
  title: z.string().optional(),
  body: z.string().nullish(),
  workflowStateId: z.string().uuid().optional(),
  dueDate: DateStringSchema.nullish(),
  isArchived: z.boolean().optional(),
})
export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>

export const TaskResponseSchema = z.object({
  id: z.string(),
  label: z.string(),
  workspaceId: z.string(),
  assigneeId: z.string().optional(),
  assigneeType: AssigneeTypeSchema,
  title: z.string().optional(),
  body: z.string().optional(),
  createdById: z.string(),
  workflowStateId: z.string().uuid().optional(),
  workflowState: WorkflowStateResponseSchema,
  dueDate: DateStringSchema.optional(),
  createdAt: z.date(),
  assignee: z.union([ClientResponseSchema, InternalUsersSchema, CompanyResponseSchema]),
  lastActivityLogUpdated: z.date().optional(),
  isArchived: z.boolean().optional(),
})

export type TaskResponse = z.infer<typeof TaskResponseSchema>
