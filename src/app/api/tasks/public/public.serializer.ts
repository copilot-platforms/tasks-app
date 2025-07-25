import APIError from '@/app/api/core/exceptions/api'
import DBClient from '@/lib/db'
import { RFC3339DateSchema } from '@/types/common'
import {
  CreateTaskRequest,
  CreateTaskRequestSchema,
  UpdateTaskRequest,
  UpdateTaskRequestSchema,
} from '@/types/dto/tasks.dto'
import { rfc3339ToDateString, toRFC3339 } from '@/utils/dateHelper'
import { copyTemplateMediaToTask } from '@/utils/signedTemplateUrlReplacer'
import { replaceImageSrc } from '@/utils/signedUrlReplacer'
import { getSignedUrl } from '@/utils/signUrl'
import { PublicTaskCreateDto, PublicTaskDto, PublicTaskDtoSchema, PublicTaskUpdateDto } from '@api/tasks/public/public.dto'
import { Task, WorkflowState } from '@prisma/client'
import httpStatus from 'http-status'
import { z } from 'zod'

export const statusMap: Record<WorkflowState['type'], PublicTaskDto['status']> = Object.freeze({
  backlog: 'todo',
  unstarted: 'todo',
  started: 'inProgress',
  completed: 'completed',
  cancelled: 'todo',
})

export const workflowStateTypeMap: Record<PublicTaskDto['status'], WorkflowState['type']> = Object.freeze({
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
      dueDate: toRFC3339(task.dueDate),
      label: task.label,
      status: statusMap[task.workflowState.type],
      templateId: task.templateId,
      createdBy: task.createdById,
      completedDate: toRFC3339(task.completedAt),
      creatorType: 'internalUser',
      createdDate: RFC3339DateSchema.parse(toRFC3339(task.createdAt)),
      isArchived: task.isArchived,
      archivedDate: toRFC3339(task.lastArchivedDate),
      archivedBy: task.archivedBy,
      isDeleted: task.deletedAt ? true : false,
      deletedDate: toRFC3339(task.deletedAt),
      source: task.source,
      deletedBy: task.deletedBy,
      completedBy: task.completedBy,
      completedByUserType: task.completedByUserType,
      internalUserId: task.internalUserId,
      clientId: task.clientId,
      companyId: task.companyId,
    }
  }

  static serialize(task: Task & { workflowState: WorkflowState }): PublicTaskDto {
    return PublicTaskDtoSchema.parse(PublicTaskSerializer.serializeUnsafe(task))
  }

  static serializeMany(tasks: (Task & { workflowState: WorkflowState })[]): PublicTaskDto[] {
    return z.array(PublicTaskDtoSchema).parse(tasks.map((task) => PublicTaskSerializer.serializeUnsafe(task)))
  }

  static async getWorkflowStateIdForStatus(
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

  static async applyTemplateToTaskContent(
    templateId: string,
    workspaceId: string,
    existingTitle: string | null | undefined,
    existingBody: string | null | undefined,
    existingWorkflowStateId: string | null | undefined,
  ): Promise<{ title: string; body: string; workflowStateId: string }> {
    const db = DBClient.getInstance()
    const template = await db.taskTemplate.findFirst({
      where: {
        id: templateId,
        workspaceId: workspaceId,
      },
    })
    if (!template) {
      throw new APIError(httpStatus.NOT_FOUND, 'The requested template was not found')
    }

    let replacedBody
    if (template?.body) {
      replacedBody = await copyTemplateMediaToTask(workspaceId, template.body)
      replacedBody = replacedBody && (await replaceImageSrc(replacedBody, getSignedUrl))
    }

    const title = (existingTitle && existingTitle !== template.title ? `${existingTitle} ` : '') + template.title
    const body = (existingBody ? `${existingBody} ` : '') + (replacedBody || template.body)
    const workflowStateId = existingWorkflowStateId || template.workflowStateId
    return { title, body, workflowStateId }
  }

  static async deserializeCreatePayload(payload: PublicTaskCreateDto, workspaceId: string): Promise<CreateTaskRequest> {
    let workflowStateId = await PublicTaskSerializer.getWorkflowStateIdForStatus(payload.status, workspaceId)
    let title = payload.name
    let body = payload.description
    if (payload.templateId) {
      const updated = await PublicTaskSerializer.applyTemplateToTaskContent(
        payload.templateId,
        workspaceId,
        title,
        body,
        workflowStateId,
      )
      title = updated.title
      body = updated.body
      workflowStateId = updated.workflowStateId
    }

    return CreateTaskRequestSchema.parse({
      title,
      body,
      workflowStateId: workflowStateId,
      dueDate: rfc3339ToDateString(payload.dueDate),
      parentId: payload.parentTaskId,
      templateId: payload.templateId,
      createdById: payload.createdBy,
      internalUserId: payload.internalUserId ?? null,
      clientId: payload.clientId ?? null,
      companyId: payload.companyId ?? null,
    })
  }

  static async deserializeUpdatePayload(payload: PublicTaskUpdateDto, workspaceId: string): Promise<UpdateTaskRequest> {
    const workflowStateId = await PublicTaskSerializer.getWorkflowStateIdForStatus(payload.status, workspaceId)
    return UpdateTaskRequestSchema.parse({
      title: payload.name,
      body: payload.description,
      dueDate: rfc3339ToDateString(payload.dueDate),
      isArchived: payload.isArchived,
      workflowStateId,
      internalUserId: payload.internalUserId ?? null,
      clientId: payload.clientId ?? null,
      companyId: payload.companyId ?? null,
    })
  }
}
