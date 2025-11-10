import { TaskResponse } from '@/types/dto/tasks.dto'

export const shouldIgnoreSelfUpdate = (activeTask: TaskResponse | undefined, token: string) => {
  if (activeTask?.lastUpdatedToken === token.slice(0, 25)) {
    return true
  }
  return false
}
