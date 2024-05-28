import { apiUrl } from '@/config'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export const updateTaskDetail = async (token: string, task_id: string, title: string, detail: string) => {
  await fetch(`${apiUrl}/api/tasks/${task_id}?token=${token}`, {
    method: 'PATCH',
    body: JSON.stringify({
      title,
      body: detail,
    }),
  })
  revalidateTag('getAllTasks')
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
  revalidateTag('getAllTasks')
}

export const deleteTask = async (token: string, task_id: string) => {
  await fetch(`${apiUrl}/api/tasks/${task_id}?token=${token}`, {
    method: 'DELETE',
  })
  revalidateTag('getAllTasks')
  redirect(`/?token=${token}`)
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
