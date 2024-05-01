import { apiUrl } from '@/config'
import { CreateTaskRequest } from '@/types/dto/tasks.dto'
import { revalidateTag } from 'next/cache'

export const handleCreate = async (token: string, payload: CreateTaskRequest) => {
  fetch(`${apiUrl}/api/tasks?token=${token}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  revalidateTag('getAllTasks')
}

export const updateWorkflowStateIdOfTask = async (token: string, taskId: string, targetWorkflowStateId: string) => {
  fetch(`${apiUrl}/api/tasks/${taskId}?token=${token}`, {
    method: 'PATCH',
    body: JSON.stringify({
      workflowStateId: targetWorkflowStateId,
    }),
  })
  revalidateTag('getAllTasks')
}
