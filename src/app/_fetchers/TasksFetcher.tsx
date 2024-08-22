import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { sortTaskByDescendingOrder } from '@/utils/sortTask'

interface Props {
  token: string
}

const getAllTasks = async (token: string): Promise<TaskResponse[]> => {
  const res = await fetch(`${apiUrl}/api/tasks?token=${token}`, {
    next: { tags: ['getTasks'] },
  })

  const data = await res.json()

  return sortTaskByDescendingOrder(data.tasks)
}

export const TasksFetcher = async ({ token }: Props) => {
  const tasks = await getAllTasks(token)

  return <ClientSideStateUpdate tasks={tasks}>{null}</ClientSideStateUpdate>
}
