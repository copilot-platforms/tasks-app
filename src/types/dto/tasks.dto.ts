import { AssigneeType as PrismaAssigneeType, Task } from '@prisma/client'
import { z } from 'zod'
import { WorkflowStateResponseSchema } from './workflowStates.dto'
import { DateStringSchema } from '@/types/date'
import { ClientResponseSchema, CompanyResponseSchema, InternalUsersSchema } from '../common'

export const validateUserIds = (
  data: { internalUserId?: string | null; clientId?: string | null; companyId?: string | null },
  ctx: z.RefinementCtx,
) => {
  const { internalUserId, clientId, companyId } = data

  if (internalUserId && (clientId || companyId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'internalUserId cannot be combined with clientId or companyId',
      path: ['internalUserId'],
    })
  }

  if (clientId && !companyId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'companyId is required when clientId is provided',
      path: ['companyId'],
    })
  }
}

export const AssigneeTypeSchema = z.nativeEnum(PrismaAssigneeType).nullish()
export type AssigneeType = z.infer<typeof AssigneeTypeSchema>

export const CreateTaskRequestSchema = z
  .object({
    title: z.string().min(1),
    body: z.string().optional(),
    workflowStateId: z.string().uuid(),
    dueDate: DateStringSchema.nullish(),
    parentId: z.string().uuid().nullish(),
    templateId: z.string().uuid().nullish(),
    createdById: z.string().uuid().optional(),
    internalUserId: z.string().uuid().nullish().default(null),
    clientId: z.string().uuid().nullish().default(null),
    companyId: z.string().uuid().nullish().default(null),
  })
  .superRefine(validateUserIds)

export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>

export const UpdateTaskRequestSchema = z
  .object({
    title: z.string().optional(),
    body: z.string().optional(),
    workflowStateId: z.string().uuid().optional(),
    dueDate: DateStringSchema.nullish(),
    isArchived: z.boolean().optional(),
    internalUserId: z.string().uuid().nullish(),
    clientId: z.string().uuid().nullish(),
    companyId: z.string().uuid().nullish(),
  })
  .superRefine(validateUserIds)

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
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullish(),
  assignee: z.union([ClientResponseSchema, InternalUsersSchema, CompanyResponseSchema]).optional(),
  lastActivityLogUpdated: z.string().datetime().nullish(),
  lastSubtaskUpdated: z.string().datetime().nullish(),
  isArchived: z.boolean().optional(),
  lastArchivedDate: z.string().datetime(),
  parentId: z.string().nullish(),
  subtaskCount: z.number(),
  internalUserId: z.string().uuid().nullish(),
  clientId: z.string().uuid().nullish(),
  companyId: z.string().uuid().nullish(),
})

export type TaskResponse = z.infer<typeof TaskResponseSchema>

export const SubTaskStatusSchema = z.object({
  count: z.number(),
  canCreateSubtask: z.boolean(),
})

export type SubTaskStatusResponse = z.infer<typeof SubTaskStatusSchema>

export type AncestorTaskResponse = Pick<Task, 'id' | 'title' | 'label'> & {
  internalUserId: string | null
  clientId: string | null
  companyId: string | null
}
