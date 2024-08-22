import { apiUrl } from '@/config'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { UserType } from '@/types/interfaces'

export const redirectIfTaskCta = (searchParams: Record<string, string>) => {
  const taskId = z.string().safeParse(searchParams.taskId)
  if (taskId.data) {
    redirect(`${apiUrl}/detail/${taskId.data}/iu?token=${z.string().parse(searchParams.token)}&isRedirect=1`)
  }
}

export const RESOURCE_NOT_FOUND_REDIRECT_PATHS = {
  [UserType.INTERNAL_USER]: '/',
  [UserType.CLIENT_USER]: '/client',
}

export const redirectIfResourceNotFound = <R>(
  searchParams: Record<string, string>,
  resource: R,
  isInternalUser: boolean,
): void => {
  if (!resource) {
    redirect(`${apiUrl}/${!isInternalUser ? 'client' : ''}?token=${z.string().parse(searchParams.token)}`)
  }
}
