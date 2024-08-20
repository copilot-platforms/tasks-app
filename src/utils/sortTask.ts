import { TaskResponse } from '@/types/dto/tasks.dto'

export const sortTaskByDescendingOrder = (tasks: TaskResponse[]) => {
  return (tasks ?? []).sort((a, b) => {
    const dateA = new Date(a.createdAt).getDate()
    const dateB = new Date(b.createdAt).getDate()
    return dateB - dateA
  })
}
