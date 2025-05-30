import { ClientResponseSchema, CompanyResponseSchema, InternalUsersSchema } from '@/types/common'
import { CreateTaskRequest } from '@/types/dto/tasks.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssigneeCombined } from '@/types/interfaces'
import { z } from 'zod'

export const getTempTask = (
  tempId: string,
  payload: CreateTaskRequest,
  workflowStates: WorkflowStateResponse[],
  assignee: IAssigneeCombined[],
  workspaceId: string,
  userId: string,
  parentId: string,
) => {
  return {
    id: tempId,
    label: 'temp-label',
    workspaceId: workspaceId,
    assigneeId: (payload.internalUserId || payload.clientId || payload.companyId) ?? '',
    title: payload.title,
    body: payload.body,
    workflowStateId: payload.workflowStateId,
    workflowState: workflowStates.find((ws) => ws.id === payload.workflowStateId)!,
    createdById: userId,
    assignee: z
      .union([ClientResponseSchema, InternalUsersSchema, CompanyResponseSchema])
      .parse(assignee.find((a) => a.id === (payload.internalUserId || payload.clientId || payload.companyId))),
    createdAt: new Date(),
    lastArchivedDate: new Date().toISOString(),
    isArchived: false,
    parentId: parentId,
    dueDate: payload.dueDate ?? undefined,
    subtaskCount: 0,
  }
}
