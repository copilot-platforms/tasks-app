import { TaskResponse } from '@/types/dto/tasks.dto'

export const sortTaskByDescendingOrder = (tasks: TaskResponse[]) => {
  if (!tasks) {
    throw new Error('Something went wrong!')
  }
  return tasks.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA
  })
}
