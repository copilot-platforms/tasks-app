import { apiUrl } from '@/config'
import { revalidateTag } from 'next/cache'

export const handleCreate = async (
  token: string,
  title: string,
  description: string,
  workflowStateId: string,
  assigneeId: string,
  assigneeType: string,
) => {
  await fetch(`${apiUrl}/api/tasks?token=${token}`, {
    method: 'POST',
    body: JSON.stringify({
      title,
      body: description,
      workflowStateId,
      assigneeId,
      assigneeType,
    }),
  })
  revalidateTag('getAllTasks')
}

export const updateWorkflowStateIdOfTask = async (token: string, taskId: string, targetWorkflowStateId: string) => {
  await fetch(`${apiUrl}/api/tasks/${taskId}?token=${token}`, {
    method: 'PATCH',
    body: JSON.stringify({
      workflowStateId: targetWorkflowStateId,
    }),
  })
  revalidateTag('getAllTasks')
}
