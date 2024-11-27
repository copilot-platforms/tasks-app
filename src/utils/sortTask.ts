import { TaskResponse } from '@/types/dto/tasks.dto'

export const sortTaskByDescendingOrder = (tasks: TaskResponse[]) => {
  return [...tasks]
    .map((task) => {
      const createdAt = typeof task.createdAt === 'string' ? task.createdAt : new Date(task.createdAt).toISOString() // Convert Date to ISO string
      return {
        ...task,
        createdAt: createdAt.endsWith('Z') ? createdAt : `${createdAt}Z`, // Ensure trailing 'Z'
      }
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })
}
