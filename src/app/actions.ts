import { apiUrl } from '@/config'
import { CreateTaskRequest, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'
import { revalidateTag } from 'next/cache'

export const handleCreate = async (token: string, payload: CreateTaskRequest) => {
  fetch(`${apiUrl}/api/tasks?token=${token}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  revalidateTag('getAllTasks')
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

export const updateViewModeSettings = async (token: string, payload: CreateViewSettingsDTO) => {
  await fetch(`${apiUrl}/api/view-settings?token=${token}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  revalidateTag('getViewSettings')
  revalidateTag('getAllTasks')
  revalidateTag('getAllWorkflowStates')
}
