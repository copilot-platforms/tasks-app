'use server'
import { apiUrl } from '@/config'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { CreateTaskRequest, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'

export const handleCreate = async (token: string, payload: CreateTaskRequest) => {
  const response = await fetch(`${apiUrl}/api/tasks?token=${token}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return await response.json()
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
}

export const updateViewModeSettings = async (token: string, payload: CreateViewSettingsDTO) => {
  await fetch(`${apiUrl}/api/view-settings?token=${token}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
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
}
