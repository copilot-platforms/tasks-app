import { getAssigneeName } from '@/utils/assignee'
import { bottleneck } from '@/utils/bottleneck'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { CommentRepository } from '@api/comment/comment.repository'
import { CommentService } from '@api/comment/comment.service'
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

/**
 * This job is used to send notifications to all active users commenting on a thread, when a new reply is created to a comment.
 */
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

    const commentsRepo = new CommentRepository(user)
    const copilot = new CopilotAPI(user.token)

    const senderId = z
      .string()
      .uuid()
      .parse(user.internalUserId || user.clientId)

    const deliveryTargets = await getNotificationDetails(copilot, user, comment)

    const notificationPromises: Promise<unknown>[] = []
    const queueNotificationPromise = <T>(promise: Promise<T>): void => {
      notificationPromises.push(bottleneck.schedule(() => promise))
    }

    // Get all initiators involved in thread except the current user
    const threadInitiators = (await commentsRepo.getFirstCommentInitiators([comment.parentId], 10_000)).filter(
      (initiator) => initiator.initiatorId !== senderId,
    )

    // Queue notifications to every unique reply initiator
    for (let initiator of threadInitiators) {
      const promise = getInitiatorNotificationPromises(
        copilot,
        initiator,
        senderId,
        deliveryTargets,
        // NOTE: We are sending payload.task.companyId here. This might sound silly, i agree.
        // However, it is very safe to assume that client users can ONLY reply to comments in tasks
        // assigned to their company, or to them. In both cases, payload.task.companyId works
        // For IU tasks, this will be undefined
        payload.task.companyId || undefined,
      )
      promise && queueNotificationPromise(promise) // It's certain we will get a promise here
    }

    const commentService = new CommentService(user)
    const parentComment = await commentService.getCommentById(comment.parentId)
    if (parentComment) {
      // Queue notification for parent comment initiator, if:
      // - Parent Comment hasn't been deleted yet
      // - Parent Comment initiatorId isn't this current user
      // - Parent comment hasn't been already sent a notification through a reply
      const isParentCommentDeleted = !parentComment.deletedAt
      const parentInitiatorIsCurrentUser = parentComment.initiatorId === senderId
      const isNotificationAlreadySent = threadInitiators.some(
        (initiator) => initiator.initiatorId === parentComment.initiatorId,
      )
      if (!isParentCommentDeleted && !parentInitiatorIsCurrentUser && !isNotificationAlreadySent) {
        let promise = getInitiatorNotificationPromises(
          copilot,
          parentComment,
          senderId,
          deliveryTargets,
          payload.task.companyId || undefined,
        )
        // If there is no "initiatorType" for parentComment we have to be slightly creative (coughhackycough)
        if (!promise) {
          promise = getNotificationToUntypedInitiator(copilot, parentComment, payload.task, senderId, deliveryTargets)
        }
        queueNotificationPromise(promise)
      }
    }

    await Promise.all(notificationPromises)
  },
})

const getNotificationDetails = async (copilot: CopilotAPI, user: User, comment: Comment) => {
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
      title: 'Reply was added',
      body: `${senderName} replied to your comment on the task ‘${task.title}’.`,
      ctaParams,
    },
    email: {
      subject: 'A reply was added',
      header: `A reply was added by ${senderName}`,
      title: 'View reply',
      body: `${senderName} replied to a thread on the task '${task.title}'. To view the reply, open the task below.`,
      ctaParams,
    },
  }

  return deliveryTargets
}

const getInitiatorNotificationPromises = async (
  copilot: CopilotAPI,
  initiator: { initiatorId: string; initiatorType: CommentInitiator | null },
  senderId: string,
  deliveryTargets: { inProduct: Record<'title', any>; email: object },
  initiatorCompanyId?: string,
  assume?: CommentInitiator,
) => {
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
      recipientCompanyId: initiatorCompanyId,
      deliveryTargets: { email: deliveryTargets.email },
    })
  } else {
    return null
  }
}

const getNotificationToUntypedInitiator = async (
  copilot: CopilotAPI,
  parentComment: Comment,
  task: Task,
  senderId: string,
  deliveryTargets: { inProduct: Record<'title', any>; email: object },
) => {
  let promise
  try {
    await copilot.getInternalUser(parentComment.initiatorId)
    promise = getInitiatorNotificationPromises(
      copilot,
      parentComment,
      senderId,
      deliveryTargets,
      task.companyId || undefined,
      CommentInitiator.internalUser,
    )
  } catch (e) {
    try {
      promise = getInitiatorNotificationPromises(
        copilot,
        parentComment,
        senderId,
        deliveryTargets,
        task.companyId || undefined,
        CommentInitiator.client,
      )
    } catch (e) {
      console.error(e)
      throw new Error('Unable to resolve comment initiator as IU or Client')
    }
  }
  return promise
}
