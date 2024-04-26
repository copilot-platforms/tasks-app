import { apiUrl } from '@/config'
import { revalidateTag } from 'next/cache'

export const updateTaskDetail = async (token: string, task_id: string, title: string, detail: string) => {
  fetch(`${apiUrl}/api/tasks/${task_id}?token=${token}`, {
    method: 'PATCH',
    body: JSON.stringify({
      title,
      body: detail,
    }),
  })
  revalidateTag('getAllTasks')
}

export const updateAssignee = async (token: string, task_id: string, assigneeType: string, assigneeId: string) => {
  fetch(`${apiUrl}/api/tasks/${task_id}?token=${token}`, {
    method: 'PATCH',
    body: JSON.stringify({
      assigneeType,
      assigneeId,
    }),
  })
  revalidateTag('getOneTask')
  revalidateTag('getAllTasks')
}
