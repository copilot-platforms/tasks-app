import { sendCommentCreateNotifications } from '@/jobs/notifications'
import { sendReplyCreateNotifications } from '@/jobs/notifications/send-reply-create-notifications'
import { ClientsResponse, InitiatedEntity, InternalUsersResponse } from '@/types/common'
import { CreateComment, UpdateComment } from '@/types/dto/comment.dto'
import { getArrayDifference, getArrayIntersection } from '@/utils/array'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { CommentAddedSchema } from '@api/activity-logs/schemas/CommentAddedSchema'
import { ActivityLogger } from '@api/activity-logs/services/activity-logger.service'
import { CommentRepository } from '@api/comment/comment.repository'
import APIError from '@api/core/exceptions/api'
import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { UserAction } from '@api/core/types/user'
import { TasksService } from '@api/tasks/tasks.service'
import { ActivityType, Comment, CommentInitiator } from '@prisma/client'
import httpStatus from 'http-status'
import { z } from 'zod'

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
      await sendCommentCreateNotifications.trigger({ user: this.user, task, comment })
    } else {
      await sendReplyCreateNotifications.trigger({ user: this.user, task, comment })
    }

    return comment

    // if (data.mentions) {
    //   await notificationService.createBulkNotification(NotificationTaskActions.Mentioned, task, data.mentions, {
    //     commentId: comment.id,
    //   })
    // }
  }

  async delete(id: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Delete, Resource.Comment)

    const replyCounts = await this.getReplyCounts([id])
    const comment = await this.db.comment.delete({ where: { id } })

    // Delete corresponding activity log as well, so as to remove comment from UI
    // If activity log exists but comment has a `deletedAt`, show "Comment was deleted" card instead
    if (!replyCounts[id]) {
      // If there are 0 replies, key won't be in object
      await this.deleteRelatedActivityLogs(id)
    }

    // If parent comment now has no replies and is also deleted, delete parent as well
    if (comment.parentId) {
      const parent = await this.db.comment.findFirst({ where: { id: comment.parentId, deletedAt: undefined } })
      if (parent?.deletedAt) {
        await this.deleteEmptyParentActivityLog(parent)
      }
    }

    const tasksService = new TasksService({ user: this.user })
    await tasksService.setNewLastActivityLogUpdated(comment.taskId)
    return comment
  }

  private async deleteEmptyParentActivityLog(parent: Comment) {
    const parentReplyCounts = await this.getReplyCounts([parent.id])
    if (!parentReplyCounts[parent.id]) {
      await this.deleteRelatedActivityLogs(parent.id)
    }
  }

  private async deleteRelatedActivityLogs(id: string) {
    // Can't use `delete` only here, but only one activity log will have details.id with commentId
    await this.db.activityLog.deleteMany({
      where: {
        details: { path: ['id'], equals: id },
      },
    })
  }

  async update(id: string, data: UpdateComment) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Update, Resource.Comment)

    const filters = { id, workspaceId: this.user.workspaceId, initiatorId: this.user.internalUserId, deletedAt: undefined }
    const prevComment = await this.db.comment.findFirst({
      where: filters,
    })
    if (!prevComment) throw new APIError(httpStatus.NOT_FOUND, 'The comment to update was not found')

    const comment = await this.db.comment.update({
      where: filters,
      data,
    })
    const tasksService = new TasksService({ user: this.user })
    await tasksService.setNewLastActivityLogUpdated(comment.taskId)
    return comment
  }

  async getCommentById(id: string) {
    const copilot = new CopilotAPI(this.user.token)
    const comment = await this.db.comment.findFirst({
      where: { id, deletedAt: undefined }, // Can also get soft deleted comments
    })
    if (!comment) return null

    let initiator
    if (comment?.initiatorType === CommentInitiator.internalUser) {
      initiator = await copilot.getInternalUser(comment.initiatorId)
    } else if (comment?.initiatorType === CommentInitiator.client) {
      initiator = await copilot.getClient(comment.initiatorId)
    } else {
      try {
        initiator = await copilot.getInternalUser(comment.initiatorId)
      } catch (e) {
        initiator = await copilot.getClient(comment.initiatorId)
      }
    }

    return { ...comment, initiator }
  }

  async getCommentsByIds(commentIds: string[]) {
    return await this.db.comment.findMany({
      where: {
        id: { in: commentIds },
        deletedAt: undefined, // Also get deleted comments (to show if comment parent was deleted)
      },
    })
  }

  async getComments({ parentId }: { parentId: string }) {
    return await this.db.comment.findMany({
      where: {
        parentId,
        workspaceId: this.user.workspaceId,
      },
      orderBy: { createdAt: 'asc' },
    })
  }

  /**
   * Returns an object with parentId as key and array of reply comments containing that comment as parentId
   * as value
   */
  async getReplyCounts(commentIds: string[]): Promise<Record<string, number>> {
    if (!commentIds) return {}

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
  async getThreadInitiators(
    commentIds: string[],
    internalUsers: InternalUsersResponse,
    clients: ClientsResponse,
    opts: {
      limit?: number
      onlyIds?: boolean
    } = { limit: 3, onlyIds: false },
  ) {
    if (!commentIds.length) return {}
    const commentRepo = new CommentRepository(this.user)
    const results = await commentRepo.getFirstCommentInitiators(commentIds, opts.limit)

    const initiators: Record<string, unknown[]> = {}
    // Extract initiator details
    for (let { parentId, initiatorId, initiatorType } of results) {
      if (!parentId) continue
      initiators[parentId] ??= []
      // If we are in onlyIds mode, append userId only, instead of full user details
      if (opts.onlyIds) {
        initiators[parentId].push(initiatorId)
        continue
      }

      let user
      const getUserById = (user: { id: string }) => user.id === initiatorId
      // Get full initiator body from Copilot API
      // NOTE: initiatorType was recently implemented, and it will be null for older comments.
      // for replies it is safe to assume every reply will have a initiatorType since it was implemented in the same milestone
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
    if (!commentIds.length) return []

    let replies: Comment[] = []

    // Exclude any expandComments that aren't in commentIds so user can't inject
    // random ids to access comments outside of their scope
    const validExpandComments = expandComments.length ? getArrayIntersection(commentIds, expandComments) : []
    // Exclude any ids already in expandComments, since this will be used to limit to 3 replies per parent
    commentIds = validExpandComments.length ? getArrayDifference(commentIds, validExpandComments) : commentIds

    const commentRepo = new CommentRepository(this.user)
    if (validExpandComments.length) {
      const expandedReplies = await commentRepo.getAllRepliesForParents(expandComments)
      replies = [...replies, ...expandedReplies]
    }
    const limitedReplies = await commentRepo.getLimitedRepliesForParents(commentIds)
    replies = [...replies, ...limitedReplies]

    return replies
  }

  async addInitiatorDetails(comments: InitiatedEntity[]) {
    if (!comments.length) {
      return comments
    }

    const copilot = new CopilotAPI(this.user.token)
    const [internalUsers, clients] = await Promise.all([copilot.getInternalUsers(), copilot.getClients()])

    return comments.map((comment) => {
      let initiator
      const getUser = (user: { id: string }) => user.id === comment.initiatorId

      if (comment.initiatorType === CommentInitiator.internalUser) {
        initiator = internalUsers.data.find(getUser)
      } else if (comment.initiatorType === CommentInitiator.client) {
        initiator = clients?.data?.find(getUser)
      } else {
        initiator = internalUsers.data.find(getUser) || clients?.data?.find(getUser)
      }
      return { ...comment, initiator }
    })
  }
}
