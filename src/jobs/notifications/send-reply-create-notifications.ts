import { CommentService } from '@/app/api/comment/comment.service'
import { getAssigneeName } from '@/utils/assignee'
import { bottleneck } from '@/utils/bottleneck'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { CommentRepository } from '@api/comment/comment.repository'
import User from '@api/core/models/User.model'
import { TasksService } from '@api/tasks/tasks.service'
import { Comment, CommentInitiator, Task } from '@prisma/client'
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
    console.log('user', user)

    const commentsRepo = new CommentRepository(user)
    const copilot = new CopilotAPI(user.token)

    const senderId = z
      .string()
      .uuid()
      .parse(user.internalUserId || user.clientId)

    const deliveryTargets = await getNotificationDetails(copilot, user, comment)
    console.log('ddd', deliveryTargets)

    const notificationPromises: Promise<unknown>[] = []

    const queueNotificationPromise = <T>(promise: Promise<T>): void => {
      notificationPromises.push(bottleneck.schedule(() => promise))
    }

    // Get all initiators involved in thread except the current user
    const threadInitiators = (await commentsRepo.getFirstCommentInitiators([comment.parentId], 10_000)).filter(
      (initiator) => initiator.initiatorId !== senderId,
    )
    console.log('ti', threadInitiators)

    // Queue notifications to every unique reply initiator
    for (let initiator of threadInitiators) {
      const promise = getInitiatorNotificationPromises(copilot, initiator, senderId, deliveryTargets)
      promise && queueNotificationPromise(promise) // It's certain we will get a promise here
    }

    // Queue notification for parent comment initiator, if comment hasn't been deleted yet
    const commentService = new CommentService(user)
    const parentComment = await commentService.getCommentById(comment.parentId)
    if (parentComment && parentComment.initiatorId !== senderId && !parentComment.deletedAt) {
      let promise = getInitiatorNotificationPromises(copilot, parentComment, senderId, deliveryTargets)
      // If there is no "initiatorType" for parentComment we have to be slightly creative (coughhackycough)
      if (!promise) {
        try {
          await copilot.getInternalUser(parentComment.initiatorId)
          promise = getInitiatorNotificationPromises(
            copilot,
            parentComment,
            senderId,
            deliveryTargets,
            CommentInitiator.internalUser,
          )
        } catch (e) {
          promise = getInitiatorNotificationPromises(
            copilot,
            parentComment,
            senderId,
            deliveryTargets,
            CommentInitiator.client,
          )
        }
      }
      queueNotificationPromise(promise)
    }

    await Promise.all(notificationPromises)
  },
})

async function getNotificationDetails(copilot: CopilotAPI, user: User, comment: Comment) {
  // Get parent task for title
  const tasksService = new TasksService(user)
  const task = await tasksService.getOneTask(comment.taskId)
  const senderType = user.internalUserId ? CommentInitiator.internalUser : CommentInitiator.client
  const senderId = z
    .string()
    .uuid()
    .parse(user.internalUserId || user.clientId)
  const getSenderDetails = senderType === CommentInitiator.internalUser ? copilot.getInternalUser : copilot.getClient
  const sender = await getSenderDetails(senderId)
  const senderName = getAssigneeName(sender)

  const ctaParams = { taskId: task.id, commentId: comment.parentId, replyId: comment.id }
  const deliveryTargets = {
    inProduct: {
      title: 'Someone replied to your comment',
      body: `${senderName} replied to your comment on the task ‘${task.title}’.`,
      ctaParams,
    },
    email: {
      subject: 'A reply was added',
      header: `A reply was added by ${senderName}`,
      title: 'View task',
      body: `${senderName} replied to a thread on the task '${task.title}'. To view the reply, open the task below.`,
      ctaParams,
    },
  }

  return deliveryTargets
}

async function getInitiatorNotificationPromises(
  copilot: CopilotAPI,
  initiator: { initiatorId: string; initiatorType: CommentInitiator | null },
  senderId: string,
  deliveryTargets: { inProduct: Record<'title', any>; email: object },
  assume?: CommentInitiator,
) {
  if (initiator.initiatorType === CommentInitiator.internalUser || assume === CommentInitiator.internalUser) {
    return copilot.createNotification({
      senderId,
      recipientId: initiator.initiatorId,
      deliveryTargets: { inProduct: deliveryTargets.inProduct },
    })
  } else if (initiator.initiatorType === CommentInitiator.client || assume === CommentInitiator.client) {
    return copilot.createNotification({
      senderId,
      recipientId: initiator.initiatorId,
      deliveryTargets: { email: deliveryTargets.email },
    })
  } else {
    return null
  }
}
