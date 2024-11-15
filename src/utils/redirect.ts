import { apiUrl } from '@/config'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { UserType } from '@/types/interfaces'

export const redirectIfTaskCta = (searchParams: Record<string, string>) => {
  const taskId = z.string().safeParse(searchParams.taskId)
  const commentId = z.string().safeParse(searchParams.commentId)
  const userType = searchParams.internalUserId ? 'iu' : searchParams.clientId ? 'client' : undefined
  if (taskId.data) {
    if (commentId) {
      redirect(
        `${apiUrl}/detail/${taskId.data}/${userType}?token=${z.string().parse(searchParams.token)}&commentId=${commentId}&isRedirect=1`,
      )
    }
    redirect(`${apiUrl}/detail/${taskId.data}/iu?token=${z.string().parse(searchParams.token)}&isRedirect=1`)
  }
}

export const RESOURCE_NOT_FOUND_REDIRECT_PATHS = {
  [UserType.INTERNAL_USER]: '/',
  [UserType.CLIENT_USER]: '/client',
}
