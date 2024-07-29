'use server'
import { apiUrl } from '@/config'

export const completeTask = async ({ token, taskId }: { token: string; taskId: string }) => {
  await fetch(`${apiUrl}/api/tasks/${taskId}/complete?token=${token}`, {
    method: 'PATCH',
  })
}
