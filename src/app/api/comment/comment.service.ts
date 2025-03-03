import { ActivityType, Comment, CommentInitiator, Prisma } from '@prisma/client'
import httpStatus from 'http-status'
import { z } from 'zod'

import { sendCommentCreateNotifications } from '@/jobs/notifications'
import { CreateComment, UpdateComment } from '@/types/dto/comment.dto'
import { getArrayDifference, getArrayIntersection } from '@/utils/array'
import { CommentAddedSchema } from '@api/activity-logs/schemas/CommentAddedSchema'
import { ActivityLogger } from '@api/activity-logs/services/activity-logger.service'
import APIError from '@api/core/exceptions/api'
import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { UserAction } from '@api/core/types/user'
import { TasksService } from '@api/tasks/tasks.service'

export class CommentService extends BaseService {
  async create(data: CreateComment) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.Comment)

    const initiatorId = z.string().parse(this.user.internalUserId || this.user.clientId)
    const initiatorType = this.user.internalUserId ? CommentInitiator.internalUser : CommentInitiator.client

    const task = await this.db.task.findFirst({
      where: {
        id: data.taskId,
        workspaceId: this.user.workspaceId,
      },
    })
    if (!task) throw new APIError(httpStatus.NOT_FOUND, `Could not find task with id ${data.taskId}`)

    const comment = await this.db.comment.create({
      data: {
        content: data.content,
        taskId: data.taskId,
        parentId: data.parentId,
        workspaceId: this.user.workspaceId,
        initiatorId,
        // This is safe to do, since if user doesn't have both iu ID / client ID, they will be filtered out way before
        initiatorType,
      },
    })

    const activityLogger = new ActivityLogger({ taskId: data.taskId, user: this.user })
    await activityLogger.log(
      ActivityType.COMMENT_ADDED,
      CommentAddedSchema.parse({
        id: comment.id,
        content: comment.content,
        initiatorId,
        initiatorType,
        parentId: comment.parentId,
      }),
    )

    await sendCommentCreateNotifications.trigger({ user: this.user, task: task, comment: comment })
    // if (data.mentions) {
    //   await notificationService.createBulkNotification(NotificationTaskActions.Mentioned, task, data.mentions, {
    //     commentId: comment.id,
    //   })
    // }

    return comment
  }

  async delete(id: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Delete, Resource.Comment)

    const comment = await this.db.comment.delete({ where: { id } })

    const tasksService = new TasksService(this.user)
    await tasksService.setNewLastActivityLogUpdated(comment.taskId)
    return comment
  }

  async update(id: string, data: UpdateComment) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Update, Resource.Comment)

    const filters = { id, workspaceId: this.user.workspaceId, initiatorId: this.user.internalUserId }
    const prevComment = await this.db.comment.findFirst({
      where: filters,
    })
    if (!prevComment) throw new APIError(httpStatus.NOT_FOUND, 'The comment to update was not found')

    const comment = await this.db.comment.update({
      where: filters,
      data,
    })
    const tasksService = new TasksService(this.user)
    await tasksService.setNewLastActivityLogUpdated(comment.taskId)
    return comment
  }

  async getCommentsByIds(commentIds: string[]) {
    return await this.db.comment.findMany({
      where: {
        id: {
          in: commentIds,
        },
      },
    })
  }

  async getComments({ parentId }: { parentId: string }) {
    return await this.db.comment.findMany({
      where: {
        parentId,
        workspaceId: this.user.workspaceId,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getReplies(commentIds: string[], expandComments: string[] = []) {
    let replies: Comment[] = []

    // Exclude any expandComments that aren't in commentIds so user can't inject
    // random ids to access comments outside of their scope
    const validExpandComments = expandComments.length ? getArrayIntersection(commentIds, expandComments) : []
    // Exclude any ids already in expandComments, since this will be used to limit to 3 replies per parent
    commentIds = validExpandComments.length ? getArrayDifference(commentIds, validExpandComments) : commentIds

    if (validExpandComments.length) {
      const expandedReplies = await this.db.comment.findMany({
        where: {
          parentId: { in: expandComments },
          workspaceId: this.user.workspaceId,
        },
        orderBy: { createdAt: 'desc' },
      })
      replies = [...replies, ...expandedReplies]
    }

    const limitedReplies = await this.db.$queryRaw<Comment[]>`
      WITH replies AS (
        SELECT *,
          ROW_NUMBER() OVER (PARTITION BY "parentId" ORDER BY "createdAt" DESC) AS rank
        FROM "Comments"
        WHERE "parentId"::text IN (${Prisma.join(commentIds)})
          AND "deletedAt" IS NULL
      )

      SELECT "id", "content", "initiatorId", "initiatorType", "parentId", "taskId", "workspaceId", "createdAt", "updatedAt", "deletedAt"
      FROM replies
      WHERE rank <= 3;
    `
    // IMPORTANT: If you change the schema of Comments table be sure to add them here too.
    replies = [...replies, ...limitedReplies]

    return replies
  }
}
