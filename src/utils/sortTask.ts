import { TaskResponse } from '@/types/dto/tasks.dto'

export const sortTaskByDescendingOrder = (tasks: TaskResponse[]) => {
  return tasks.sort((a, b) => {
    const dateA = new Date(a.createdAt)
    const dateB = new Date(b.createdAt)
    //@ts-ignore
    return dateB - dateA
  })
}
