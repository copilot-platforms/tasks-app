import { apiUrl } from '@/config'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export const redirectIfTaskCta = (searchParams: Record<string, string>) => {
  const taskId = z.string().safeParse(searchParams.taskId)
  if (taskId.data) {
    redirect(`${apiUrl}/detail/${taskId.data}/iu?token=${z.string().parse(searchParams.token)}`)
  }
}
