import { apiUrl } from '@/config'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { UserType } from '@/types/interfaces'
import { DeletedTaskRedirectPage } from '@/components/layouts/DeletedTaskRedirectPage'
import { UserRole } from '@/app/api/core/types/user'

export const redirectIfTaskCta = (searchParams: Record<string, string>) => {
  const taskId = z.string().safeParse(searchParams.taskId)
  if (taskId.success) {
    // 'data' doesn't indicate success, use 'success' instead
    redirect(`${apiUrl}/detail/${taskId.data}/iu?token=${z.string().parse(searchParams.token)}&isRedirect=1`)
  }
}

export const RESOURCE_NOT_FOUND_REDIRECT_PATHS = {
  [UserType.INTERNAL_USER]: '/',
  [UserType.CLIENT_USER]: '/client',
}

interface RedirectProps<R> {
  searchParams: Record<string, string>
  resource: R
  isInternalUser: boolean
}

export const redirectIfResourceNotFound = <R extends UserType>({
  searchParams,
  resource,
  isInternalUser,
}: RedirectProps<R>) => {
  return <DeletedTaskRedirectPage userType={isInternalUser ? UserRole.IU : UserRole.Client} />
}
