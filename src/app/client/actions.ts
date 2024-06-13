import { apiUrl } from '@/config'
import { revalidateTag } from 'next/cache'

export const completeTask = async ({ token, taskId }: { token: string; taskId: string }) => {
  await fetch(`${apiUrl}/api/tasks/${taskId}/complete?token=${token}`, {
    method: 'PATCH',
  })
  revalidateTag('getOneTask')
  revalidateTag('getAllTasks')
}
