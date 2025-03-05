import { ActivityType, Comment, CommentInitiator, Prisma } from '@prisma/client'
import httpStatus from 'http-status'
import { z } from 'zod'

import { sendCommentCreateNotifications } from '@/jobs/notifications'
import { CreateComment, UpdateComment } from '@/types/dto/comment.dto'
import { getArrayDifference, getArrayIntersection, groupBy } from '@/utils/array'
import { CommentAddedSchema } from '@api/activity-logs/schemas/CommentAddedSchema'
import { ActivityLogger } from '@api/activity-logs/services/activity-logger.service'
import APIError from '@api/core/exceptions/api'
import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { UserAction } from '@api/core/types/user'
import { TasksService } from '@api/tasks/tasks.service'
import { ClientResponse, ClientsResponse, InternalUsersResponse } from '@/types/common'
import { IAssigneeCombined } from '@/types/interfaces'

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

    if (!comment.parentId) {
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
    }
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
        deletedAt: undefined,
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

  async getReplyCounts(commentIds: string[]): Promise<Record<string, number>> {
    const result = await this.db.comment.groupBy({
      by: ['parentId'],
      where: {
        parentId: { in: commentIds },
        workspaceId: this.user.workspaceId,
        deletedAt: null,
      },
      _count: { id: true },
    })
    const counts: Record<string, number> = {}
    result.forEach((row) => row.parentId && (counts[row.parentId] = row._count.id))
    return counts
  }

  /**
   * Gets the first 0 - n number of unique initiators for a comment thread based on the parentIds
   */
  async getThreadInitiators(commentIds: string[], internalUsers: InternalUsersResponse, clients: ClientsResponse) {
    const results = await this.db.$queryRaw<
      Array<{ parentId: string; initiatorId: string; initiatorType: CommentInitiator }>
    >`
      SELECT DISTINCT ON ("parentId", "initiatorId", "initiatorType")
        "parentId",
        "initiatorId",
        "initiatorType"
      FROM "Comments"
      WHERE "parentId"::text IN (${Prisma.join(commentIds)})
        AND "deletedAt" IS NULL
      ORDER BY "parentId", "initiatorId", "initiatorType", "createdAt" ASC
    `
    const initiators: Record<string, unknown[]> = {}
    // Extract initiator details
    for (let { parentId, initiatorId, initiatorType } of results) {
      if (!parentId) continue
      initiators[parentId] ??= []
      let user
      const getUserById = (user: { id: string }) => user.id === initiatorId

      // Get full initiator body. initiatorType was recently implemented, and it will be null for older comments
      if (initiatorType === CommentInitiator.internalUser) {
        user = internalUsers.data.find(getUserById)
      } else if (initiatorType === CommentInitiator.client) {
        user = clients.data?.find(getUserById)
      } else {
        user = internalUsers.data.find(getUserById) || clients.data?.find(getUserById)
      }
      // If initiator was deleted, return null to denote deleted user
      initiators[parentId].push(user || null)
    }
    return initiators
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

      SELECT id, content, "initiatorId", "initiatorType", "parentId", "taskId", "workspaceId", "createdAt", "updatedAt", "deletedAt"
      FROM replies
      WHERE rank <= 3;
    `
    // IMPORTANT: If you change the schema of Comments table be sure to add them here too.
    replies = [...replies, ...limitedReplies]

    return replies
  }
}
