import { apiUrl } from '@/config'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { CreateTaskRequest, TaskResponse, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { View } from '@/types/interfaces'
import { revalidateTag } from 'next/cache'

export const handleCreate = async (token: string, payload: CreateTaskRequest): Promise<TaskResponse> => {
  const response = await fetch(`${apiUrl}/api/tasks?token=${token}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  revalidateTag('getAllTasks')
  return await response.json()
}

/**
 * @deprecated
 * Use the new update task function instead. This will be completely removed in the upcoming PRs.
 */
export const updateWorkflowStateIdOfTask = async (token: string, taskId: string, targetWorkflowStateId: string) => {
  await fetch(`${apiUrl}/api/tasks/${taskId}?token=${token}`, {
    method: 'PATCH',
    body: JSON.stringify({
      workflowStateId: targetWorkflowStateId,
    }),
  })
  revalidateTag('getAllTasks')
}

export const updateTask = async ({
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
  revalidateTag('getAllTasks')
}

export const updateViewModeSettings = async (token: string, mode: View) => {
  await fetch(`${apiUrl}/api/view-settings?token=${token}`, {
    method: 'PATCH',
    body: JSON.stringify({
      viewMode: mode,
    }),
  })
  revalidateTag('getViewSettings')
  revalidateTag('getAllTasks')
  revalidateTag('getAllWorkflowStates')
}

export const getSignedUrlUpload = async (token: string, fileName: string) => {
  const res = await fetch(`${apiUrl}/api/attachments/upload?token=${token}&fileName=${fileName}`)
  const data = await res.json()
  return data.signedUrl
}

export const createMultipleAttachments = async (token: string, attachments: CreateAttachmentRequest[]) => {
  await fetch(`${apiUrl}/api/attachments/bulk?token=${token}`, {
    method: 'POST',
    body: JSON.stringify(attachments),
  })
  revalidateTag('getAllTasks')
}
