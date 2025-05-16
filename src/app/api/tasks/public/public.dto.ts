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
  archivedBy: z.string().uuid().nullable(),
  isDeleted: z.boolean().nullable(),
  deletedDate: RFC3339DateSchema.nullable(),
  source: TaskSourceSchema,
  deletedBy: z.string().uuid().nullable(),
  completedBy: z.string().uuid().nullable(),
  completedByUserType: z.nativeEnum(AssigneeType).nullable(),
  internalUserId: z.string().uuid().nullable(),
  clientId: z.string().uuid().nullable(),
  companyId: z.string().uuid().nullable(),
})
export type PublicTaskDto = z.infer<typeof PublicTaskDtoSchema>

export const PublicTaskCreateDtoSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(255)
      .refine((name) => name.trim().length > 0, {
        message: 'Required',
      })
      .transform((val) => val.trim())
      .optional(),
    description: z.string().optional(),
    parentTaskId: z.string().uuid().optional(),
    status: StatusSchema,
    dueDate: RFC3339DateSchema.optional(),
    templateId: z.string().uuid().nullish(),
    createdBy: z.string().uuid().optional(),
    internalUserId: z.string().uuid().optional(),
    clientId: z.string().uuid().optional(),
    companyId: z.string().uuid().optional(),
  })
  .superRefine((data, ctx) => {
    const { internalUserId, clientId, companyId, templateId, name } = data

    if (!templateId && !name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Name is required when templateId is not provided',
        path: ['name'],
      })
    }

    const hasInternalUser = Boolean(internalUserId)
    const hasClient = Boolean(clientId)
    const hasCompany = Boolean(companyId)

    if (!hasInternalUser && !hasClient && !hasCompany) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one of internalUserId, clientId, or companyId is required',
        path: ['internalUserId'],
      })
    }

    if (hasInternalUser && (hasClient || hasCompany)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'internalUserId cannot be combined with clientId or companyId',
        path: ['internalUserId'],
      })
    } //InternalUserId and (clientId | companyId) must be exclusive.

    if (hasClient && !hasCompany) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'companyId is required when clientId is provided',
        path: ['companyId'],
      })
    } //companyId must be provided when clientId is provided
  })
export type PublicTaskCreateDto = z.infer<typeof PublicTaskCreateDtoSchema>

export const PublicTaskUpdateDtoSchema = z.object({
  name: z
    .string()
    .max(255)
    .optional()
    .refine((name) => name === undefined || name.trim().length > 0, {
      message: 'Name must not be empty',
    })
    .transform((val) => (val === undefined ? val : val.trim())),
  description: z.string().optional(),
  dueDate: RFC3339DateSchema.nullish(),
  status: StatusSchema.optional(),
  isArchived: z.boolean().optional(),
  internalUserId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
})
export type PublicTaskUpdateDto = z.infer<typeof PublicTaskUpdateDtoSchema>
