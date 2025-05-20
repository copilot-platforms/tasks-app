import { TaskResponse } from '@/types/dto/tasks.dto'

export const checkTaskAssignedTo = (task: TaskResponse, userId: string) =>
  userId !== null && [task.internalUserId, task.clientId, task.companyId].includes(userId)
