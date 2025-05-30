'use server'

import { advancedFeatureFlag, apiUrl } from '@/config'
import { ScrapMediaRequest } from '@/types/common'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { CreateComment, UpdateComment } from '@/types/dto/comment.dto'
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
      internalUserId: payload.internalUserId,
      clientId: payload.clientId,
      companyId: payload.companyId,
      body: payload.body,
      title: payload.title,
      dueDate: payload.dueDate,
      isArchived: payload.isArchived,
    }),
  })
  revalidateTag('getOneTask')
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
  revalidateTag('getOneTask')
  // revalidateTag('getActivities')
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
  revalidateTag('getOneTask')
  // revalidateTag('getActivities')
}

export const clientUpdateTask = async (token: string, taskId: string, targetWorkflowStateId: string) => {
  await fetch(`${apiUrl}/api/tasks/${taskId}/client?token=${token}&workflowStateId=${targetWorkflowStateId}`, {
    method: 'PATCH',
  })
  revalidateTag('getOneTask')
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
  const res = await fetch(`${apiUrl}/api/comment?token=${token}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  return data.comment
  // revalidateTag('getActivities')
}

export const updateComment = async (token: string, id: string, payload: UpdateComment) => {
  const res = await fetch(`${apiUrl}/api/comment/${id}?token=${token}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  return data.comment
}

export const deleteComment = async (token: string, id: string) => {
  await fetch(`${apiUrl}/api/comment/${id}?token=${token}`, {
    method: 'DELETE',
  })
  // revalidateTag('getActivities')
}

export const postScrapMedia = async (token: string, payload: ScrapMediaRequest) => {
  await fetch(`${apiUrl}/api/scrap-medias/?token=${token}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const revalidateGetOneTask = async () => {
  revalidateTag('getOneTask')
}
