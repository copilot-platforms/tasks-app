import { RFC3339DateSchema } from '@/types/common'
import { AssigneeType } from '@prisma/client'
import { z } from 'zod'

export const TaskSourceSchema = z.enum(['web', 'api'])
export type TaskSource = z.infer<typeof TaskSourceSchema>
export const StatusSchema = z.enum(['todo', 'inProgress', 'completed'])

export const PublicTaskDtoSchema = z.object({
  id: z.string(),
  object: z.literal('task'),
  name: z.string(),
  description: z.string().nullable(),
  parentTaskId: z.string().uuid().nullable(),
  assigneeId: z.string().uuid().nullable(),
  assigneeType: z.nativeEnum(AssigneeType).nullable(),
  dueDate: RFC3339DateSchema.nullable(),
  label: z.string(),
  status: StatusSchema,
  templateId: z.string().nullable(),
  completedDate: RFC3339DateSchema.nullable(),
  createdBy: z.string().uuid(),
  createdDate: RFC3339DateSchema,
  creatorType: z.literal('internalUser'),
  isArchived: z.boolean(),
  archivedDate: RFC3339DateSchema.nullable(),
  isDeleted: z.boolean().nullable(),
  deletedDate: RFC3339DateSchema.nullable(),
  source: TaskSourceSchema,
  deletedBy: z.string().uuid().nullable(),
})
export type PublicTaskDto = z.infer<typeof PublicTaskDtoSchema>

export const PublicTaskCreateDtoSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  parentTaskId: z.string().uuid().optional(),
  status: StatusSchema,
  assigneeId: z.string().uuid(),
  assigneeType: z.nativeEnum(AssigneeType),
  dueDate: RFC3339DateSchema.optional(),
  templateId: z.string().uuid().nullish(),
})
export type PublicTaskCreateDto = z.infer<typeof PublicTaskCreateDtoSchema>

export const PublicTaskUpdateDtoSchema = z.object({
  name: z.string().max(255).optional(),
  description: z.string().optional(),
  assigneeId: z.string().uuid().optional(),
  assigneeType: z.nativeEnum(AssigneeType).optional(),
  dueDate: RFC3339DateSchema.nullish(),
  status: StatusSchema.optional(),
  isArchived: z.boolean().optional(),
})
export type PublicTaskUpdateDto = z.infer<typeof PublicTaskUpdateDtoSchema>
