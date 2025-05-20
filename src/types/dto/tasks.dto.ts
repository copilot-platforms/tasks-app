import { AssigneeType as PrismaAssigneeType, Task } from '@prisma/client'
import { z } from 'zod'
import { WorkflowStateResponseSchema } from './workflowStates.dto'
import { DateStringSchema } from '@/types/date'
import { ClientResponseSchema, CompanyResponseSchema, InternalUsersSchema } from '../common'

const requireAssigneeTypeIfAssigneeId =
  () => (data: { assigneeId?: string | null; assigneeType?: AssigneeType }, ctx: z.RefinementCtx) => {
    if (data.assigneeId && !data.assigneeType) {
      ctx.addIssue({
        path: ['assigneeType'],
        message: 'assigneeType is required when assigneeId is provided',
        code: z.ZodIssueCode.custom,
      })
    }
  }

export const AssigneeTypeSchema = z.nativeEnum(PrismaAssigneeType).nullish()
export type AssigneeType = z.infer<typeof AssigneeTypeSchema>

export const CreateTaskRequestSchema = z
  .object({
    assigneeId: z.string().optional().nullish(),
    assigneeType: AssigneeTypeSchema,
    title: z.string().min(1),
    body: z.string().optional(),
    workflowStateId: z.string().uuid(),
    dueDate: DateStringSchema.nullish(),
    parentId: z.string().uuid().nullish(),
    templateId: z.string().uuid().nullish(),
    createdById: z.string().uuid().optional(),
    internalUserId: z.string().uuid().nullish(),
    clientId: z.string().uuid().nullish(),
    companyId: z.string().uuid().nullish(),
  })
  .superRefine(requireAssigneeTypeIfAssigneeId())

export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>

export const UpdateTaskRequestSchema = z
  .object({
    assigneeId: z.string().nullish(),
    assigneeType: AssigneeTypeSchema,
    title: z.string().optional(),
    body: z.string().optional(),
    workflowStateId: z.string().uuid().optional(),
    dueDate: DateStringSchema.nullish(),
    isArchived: z.boolean().optional(),
    internalUserId: z.string().uuid().nullish(),
    clientId: z.string().uuid().nullish(),
    companyId: z.string().uuid().nullish(),
  })
  .superRefine(requireAssigneeTypeIfAssigneeId())
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
  lastArchivedDate: z.string().datetime(),
  parentId: z.string().nullish(),
  subtaskCount: z.number(),
})

export type TaskResponse = z.infer<typeof TaskResponseSchema>

export const SubTaskStatusSchema = z.object({
  count: z.number(),
  canCreateSubtask: z.boolean(),
})

export type SubTaskStatusResponse = z.infer<typeof SubTaskStatusSchema>

export type AncestorTaskResponse = Pick<Task, 'id' | 'title' | 'label'> & {
  assigneeId: string
  assigneeType: NonNullable<AssigneeType>
}
