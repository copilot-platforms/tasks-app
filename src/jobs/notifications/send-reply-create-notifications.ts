import { CommentService } from '@/app/api/comment/comment.service'
import User from '@/app/api/core/models/User.model'
import { NotificationTaskActions } from '@/app/api/core/types/tasks'
import { getInProductNotificationDetails } from '@/app/api/notification/notification.helpers'
import { NotificationService } from '@/app/api/notification/notification.service'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { Comment, Task } from '@prisma/client'
import { logger, task } from '@trigger.dev/sdk/v3'
import { z } from 'zod'

type CommentCreateNotificationPayload = {
  user: User
  task: Task
  comment: Comment
}

export const sendReplyCreateNotifications = task({
  id: 'send-reply-create-notifications',
  machine: { preset: 'medium-1x' },
  queue: { concurrencyLimit: 25 },

  run: async (payload: CommentCreateNotificationPayload, { ctx }) => {
    logger.log('Sending reply creation notifications for:', { payload, ctx })

    const { comment, user } = payload
    if (!comment.parentId) {
      throw new Error('Unable to send reply notifications since parentId does not exist')
    }

    const notificationService = new NotificationService(user)
    const commentService = new CommentService(user)
    const copilot = new CopilotAPI(user.token)
    const [internalUsers, clients] = await Promise.all([copilot.getInternalUsers(), copilot.getClients()])

    // Get all initiators involved in thread except the current user
    const threadInitiators = (
      await commentService.getThreadInitiators([comment.parentId], internalUsers, clients, {
        limit: 10_000,
        onlyIds: true, // Save extra time not hitting copilot API for user information
      })
    )[comment.parentId].filter((id): id is string => id !== user.internalUserId && id !== user.clientId)

    const senderId = z
      .string()
      .uuid()
      .parse(user.internalUserId || user.clientId)

    await notificationService.createMany(threadInitiators, {
      senderId,
      email:
        user.clientId && !user.internalUserId // Account for preview mode
          ? {
              subject: 'reply',
              header: 'reply',
              body: `reply`,
              title: 'reply task',
              ctaParams: { foo: 'bar' },
            }
          : undefined,
      inProduct: user.internalUserId
        ? {
            title: 'reply was assigned to you',
            body: `meow`,
            ctaParams: { foo: 'bar' },
          }
        : undefined,
    })
  },
})
