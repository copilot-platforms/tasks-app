import 'server-only'

import { apiUrl } from '@/config'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { UserType } from '@/types/interfaces'

export const redirectIfTaskCta = (
  searchParams: Record<string, string>,
  userType: UserType,
  fromNotificationCenter: boolean = false,
) => {
  const taskId = z.string().safeParse(searchParams.taskId)
  const commentId = z.string().safeParse(searchParams.commentId)

  if (taskId.data) {
    const notificationCenterParam = fromNotificationCenter ? '&fromNotificationCenter=1' : ''
    if (commentId.data) {
      redirect(
        `${apiUrl}/detail/${taskId.data}/${userType}?token=${z.string().parse(searchParams.token)}&commentId=${commentId.data}&isRedirect=1${notificationCenterParam}`,
      )
    }
    redirect(
      `${apiUrl}/detail/${taskId.data}/${userType}?token=${z.string().parse(searchParams.token)}&isRedirect=1${notificationCenterParam}`,
    )
  }
}

export const RESOURCE_NOT_FOUND_REDIRECT_PATHS = {
  [UserType.INTERNAL_USER]: '/',
  [UserType.CLIENT_USER]: '/client',
}

export const redirectToClientPortal = (token: string) => {
  redirect(`${apiUrl}/client?token=${token}`)
}
