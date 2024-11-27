import { TaskResponse } from '@/types/dto/tasks.dto'

export const sortTaskByDescendingOrder = (tasks: TaskResponse[]) => {
  return [...tasks]
    .map((task) => ({
      ...task,
      createdAt: task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt), // Ensure `createdAt` is a Date
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // Sort by descending order of `createdAt`
}
