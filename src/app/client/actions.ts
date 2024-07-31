'use server'
import { apiUrl } from '@/config'
import { revalidateTag } from 'next/cache'

export const completeTask = async ({ token, taskId }: { token: string; taskId: string }) => {
  await fetch(`${apiUrl}/api/tasks/${taskId}/client?token=${token}`, {
    method: 'PATCH',
  })
  revalidateTag('getAllTasks-client')
}
