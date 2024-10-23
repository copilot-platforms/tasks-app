import { withErrorHandler } from '@/app/api/core/utils/withErrorHandler'
import { UserRole } from '@api/core/types/user'
import authenticate from '@api/core/utils/authenticate'
import NotificationsService from '@api/notifications/notifications.service'
import { NextRequest, NextResponse } from 'next/server'

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await authenticate(req)
  const { senderId, recipientIds, taskId } = await req.json()
  const notificationsService = new NotificationsService(user)
  const notifications = await notificationsService.send(
    UserRole.IU,
    { senderId, recipientIds, taskId },
    {
      inProduct: {
        title: 'From /api/notifications/test/send-notification',
        body: 'Body',
        ctaParams: { taskId },
      },
    },
  )
  return NextResponse.json(notifications)
})
