import DBClient from '@/lib/db'
import { RFC3339DateSchema } from '@/types/common'
import { CreateTaskRequest, CreateTaskRequestSchema, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { rfc3339ToDateString, toRFC3339 } from '@/utils/dateHelper'
import { PublicTaskCreateDto, PublicTaskDto, PublicTaskDtoSchema, PublicTaskUpdateDto } from '@api/tasks/public/public.dto'
import { Task, WorkflowState } from '@prisma/client'
import { z } from 'zod'

const statusMap: Record<WorkflowState['type'], PublicTaskDto['status']> = Object.freeze({
  backlog: 'todo',
  unstarted: 'todo',
  started: 'inProgress',
  completed: 'completed',
  cancelled: 'todo',
})

const workflowStateTypeMap: Record<PublicTaskDto['status'], WorkflowState['type']> = Object.freeze({
  todo: 'unstarted',
  inProgress: 'started',
  completed: 'completed',
})

export class PublicTaskSerializer {
  static serializeUnsafe(task: Task & { workflowState: WorkflowState }): PublicTaskDto {
    return {
      id: task.id,
      object: 'task',
      name: task.title,
      description: task.body || '',
      parentTaskId: task.parentId,
      assigneeId: task.assigneeId,
      assigneeType: task.assigneeType,
      dueDate: toRFC3339(task.dueDate),
      label: task.label,
      status: statusMap[task.workflowState.type],
      createdBy: task.createdById,
      completedDate: toRFC3339(task.completedAt),
      creatorType: 'internalUser',
      createdDate: RFC3339DateSchema.parse(toRFC3339(task.createdAt)),
      isArchived: task.isArchived,
      archivedDate: toRFC3339(task.lastArchivedDate),
      isDeleted: task.deletedAt ? true : false,
      deletedDate: toRFC3339(task.deletedAt),
      source: 'web', // Placeholder for now
    }
  }

  static serialize(task: Task & { workflowState: WorkflowState }): PublicTaskDto {
    return PublicTaskDtoSchema.parse(PublicTaskSerializer.serializeUnsafe(task))
  }

  static serializeMany(tasks: (Task & { workflowState: WorkflowState })[]): PublicTaskDto[] {
    return z.array(PublicTaskDtoSchema).parse(tasks.map((task) => PublicTaskSerializer.serializeUnsafe(task)))
  }

  private static async getWorkflowStateIdForStatus(
    status: PublicTaskDto['status'] | undefined,
    workspaceId: string,
  ): Promise<string | undefined> {
    if (!status) return undefined

    const db = DBClient.getInstance()
    const workflowState = await db.workflowState.findFirst({
      where: { workspaceId, type: workflowStateTypeMap[status] },
      select: { id: true },
    })
    return workflowState?.id
  }

  static async deserializeCreatePayload(payload: PublicTaskCreateDto, workspaceId: string): Promise<CreateTaskRequest> {
    const workflowStateId = await PublicTaskSerializer.getWorkflowStateIdForStatus(payload.status, workspaceId)

    return CreateTaskRequestSchema.parse({
      assigneeId: payload.assigneeId,
      assigneeType: payload.assigneeType,
      title: payload.name,
      body: payload.description,
      workflowStateId: workflowStateId,
      dueDate: rfc3339ToDateString(payload.dueDate),
      parentId: payload.parentTaskId,
    })
  }

  static async deserializeUpdatePayload(payload: PublicTaskUpdateDto, workspaceId: string): Promise<UpdateTaskRequest> {
    const workflowStateId = await PublicTaskSerializer.getWorkflowStateIdForStatus(payload.status, workspaceId)
    return {
      title: payload.name,
      body: payload.description,
      assigneeId: payload.assigneeId,
      assigneeType: payload.assigneeType,
      dueDate: rfc3339ToDateString(payload.dueDate),
      isArchived: payload.isArchived,
      workflowStateId,
    }
  }
}
