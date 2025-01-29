import { UpdateTaskRequest } from '@/types/dto/tasks.dto'

export const updateTask = async ({
  token,
  taskId,
  payload,
}: {
  token: string
  taskId: string
  payload: UpdateTaskRequest
}) => {
  await fetch(`/api/tasks/${taskId}?token=${token}`, {
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

export const clientUpdateTask = async (token: string, taskId: string, targetWorkflowStateId: string) => {
  await fetch(`/api/tasks/${taskId}/client?token=${token}&workflowStateId=${targetWorkflowStateId}`, {
    method: 'PATCH',
  })
}
