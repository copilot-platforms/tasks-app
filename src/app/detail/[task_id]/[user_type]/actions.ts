'use server'

import { advancedFeatureFlag, apiUrl } from '@/config'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { CreateComment } from '@/types/dto/comment.dto'
import { UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { revalidateTag } from 'next/cache'

export const updateTaskDetail = async ({
  token,
  taskId,
  payload,
}: {
  token: string
  taskId: string
  payload: UpdateTaskRequest
}) => {
  await fetch(`${apiUrl}/api/tasks/${taskId}?token=${token}`, {
    method: 'PATCH',
    body: JSON.stringify({
      workflowStateId: payload.workflowStateId,
      assigneeId: payload.assigneeId,
      assigneeType: payload.assigneeType,
      body: payload.body,
      title: payload.title,
      dueDate: payload.dueDate,
    }),
  })
}

/**
 * Use the new update task function instead. This will be completely removed in the upcoming PRs.
 */
export const updateWorkflowStateIdOfTask = async (token: string, taskId: string, targetWorkflowStateId: string) => {
  await fetch(`${apiUrl}/api/tasks/${taskId}?token=${token}`, {
    method: 'PATCH',
    body: JSON.stringify({
      workflowStateId: targetWorkflowStateId,
    }),
  })
  //revalidation on update assignee is disabled for now since we don't have activity log enabled
  //this revalidation can be rethought and may not be needed to prevent unexpected flickering
  if (advancedFeatureFlag) {
    revalidateTag('getActivities')
  }
}

export const updateAssignee = async (
  token: string,
  task_id: string,
  assigneeType: string | null,
  assigneeId: string | null,
) => {
  await fetch(`${apiUrl}/api/tasks/${task_id}?token=${token}`, {
    method: 'PATCH',
    body: JSON.stringify({
      assigneeType,
      assigneeId,
    }),
  })
  //revalidation on update assignee is disabled for now since we don't have activity log enabled
  //this revalidation can be rethought and may not be needed to prevent unexpected flickering
  if (advancedFeatureFlag) {
    revalidateTag('getActivities')
  }
}

export const deleteTask = async (token: string, task_id: string) => {
  await fetch(`${apiUrl}/api/tasks/${task_id}?token=${token}`, {
    method: 'DELETE',
  })
}

export const postAttachment = async (token: string, payload: CreateAttachmentRequest) => {
  await fetch(`${apiUrl}/api/attachments?token=${token}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  revalidateTag('getAttachments')
}

export const deleteAttachment = async (token: string, id: string) => {
  await fetch(`${apiUrl}/api/attachments/${id}/?token=${token}`, {
    method: 'DELETE',
  })
  revalidateTag('getAttachments')
}

export const postComment = async (token: string, payload: CreateComment) => {
  await fetch(`${apiUrl}/api/comment?token=${token}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  revalidateTag('getActivities')
}

export const deleteComment = async (token: string, id: string) => {
  await fetch(`${apiUrl}/api/comment/${id}?token=${token}`, {
    method: 'DELETE',
  })
  revalidateTag('getActivities')
}
