import { withErrorHandler } from '@/app/api/core/utils/withErrorHandler'
import authenticate from '@api/core/utils/authenticate'
import NotificationsService from '@api/notifications/notifications.service'
import { NextRequest, NextResponse } from 'next/server'

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await authenticate(req)
  const { type, notifications } = await req.json()
  const notificationsService = new NotificationsService(user)
  const notificationIds = await notificationsService.markAllAsRead(type, notifications)

  return NextResponse.json({ notificationIds })
})
