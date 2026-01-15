import { sendCommentCreateNotifications } from '@/jobs/notifications'
import { sendReplyCreateNotifications } from '@/jobs/notifications/send-reply-create-notifications'
import { InitiatedEntity } from '@/types/common'
import { CreateAttachmentRequestSchema } from '@/types/dto/attachments.dto'
import { CommentsPublicFilterType, CommentWithAttachments, CreateComment, UpdateComment } from '@/types/dto/comment.dto'
import { getArrayDifference, getArrayIntersection } from '@/utils/array'
import { getFileNameFromPath } from '@/utils/attachmentUtils'
import { getFilePathFromUrl } from '@/utils/signedUrlReplacer'
import { SupabaseActions } from '@/utils/SupabaseActions'
import { getBasicPaginationAttributes } from '@/utils/pagination'
import { CommentAddedSchema } from '@api/activity-logs/schemas/CommentAddedSchema'
import { ActivityLogger } from '@api/activity-logs/services/activity-logger.service'
import { CommentRepository } from '@api/comment/comment.repository'
import APIError from '@api/core/exceptions/api'
import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { UserAction } from '@api/core/types/user'
import { TasksService } from '@api/tasks/tasks.service'
import { ActivityType, Comment, CommentInitiator, Prisma } from '@prisma/client'
import httpStatus from 'http-status'
import { z } from 'zod'
import { AttachmentsService } from '@api/attachments/attachments.service'
import { getSignedUrl } from '@/utils/signUrl'

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

    try {
      if (comment.content) {
        const newContent = await this.updateCommentIdOfAttachmentsAfterCreation(comment.content, data.taskId, comment.id)
        await this.db.comment.update({
          where: { id: comment.id },
          data: {
            content: newContent,
            updatedAt: comment.createdAt, //dont updated the updatedAt, because it will show (edited) for recently created comments.
          },
        })
        console.info('CommentService#createComment | Comment content attachments updated for comment ID:', comment.id)
      }
    } catch (e: unknown) {
      await this.db.comment.delete({ where: { id: comment.id } })
      console.error('CommentService#createComment | Rolling back comment creation', e)
    }

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
      const tasksService = new TasksService(this.user)
      await Promise.all([
        // Update last activity log timestamp for task even on replies so they are reflected in realtime
        tasksService.setNewLastActivityLogUpdated(data.taskId),
        sendReplyCreateNotifications.trigger({ user: this.user, task, comment }),
      ])
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

    const tasksService = new TasksService(this.user)
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
    const tasksService = new TasksService(this.user)
    await tasksService.setNewLastActivityLogUpdated(comment.taskId)
    return comment
  }

  async getCommentById(id: string) {
    const comment = await this.db.comment.findFirst({
      where: { id, deletedAt: undefined }, // Can also get soft deleted comments
    })
    if (!comment) return null

    let initiator
    if (comment?.initiatorType === CommentInitiator.internalUser) {
      initiator = await this.copilot.getInternalUser(comment.initiatorId)
    } else if (comment?.initiatorType === CommentInitiator.client) {
      initiator = await this.copilot.getClient(comment.initiatorId)
    } else {
      try {
        initiator = await this.copilot.getInternalUser(comment.initiatorId)
      } catch (e) {
        initiator = await this.copilot.getClient(comment.initiatorId)
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
    opts: {
      limit?: number
    } = { limit: 3 },
  ) {
    if (!commentIds.length) return {}
    const commentRepo = new CommentRepository(this.user)
    const results = await commentRepo.getFirstCommentInitiators(commentIds, opts.limit)

    const initiators: Record<string, unknown[]> = {}
    // Extract initiator ids
    for (let { parentId, initiatorId, initiatorType } of results) {
      if (!parentId) continue
      initiators[parentId] ??= []
      initiators[parentId].push(initiatorId)
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

    const [internalUsers, clients] = await Promise.all([this.copilot.getInternalUsers(), this.copilot.getClients()])

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

  private async updateCommentIdOfAttachmentsAfterCreation(htmlString: string, task_id: string, commentId: string) {
    const imgTagRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/g //expression used to match all img srcs in provided HTML string.
    const attachmentTagRegex = /<\s*[a-zA-Z]+\s+[^>]*data-type="attachment"[^>]*src="([^"]+)"[^>]*>/g //expression used to match all attachment srcs in provided HTML string.
    let match
    const replacements: { originalSrc: string; newUrl: string }[] = []

    const newFilePaths: { originalSrc: string; newFilePath: string }[] = []
    const copyAttachmentPromises: Promise<void>[] = []
    const createAttachmentPayloads = []
    const matches: { originalSrc: string; filePath: string; fileName: string }[] = []

    while ((match = imgTagRegex.exec(htmlString)) !== null) {
      const originalSrc = match[1]
      const filePath = getFilePathFromUrl(originalSrc)
      const fileName = filePath?.split('/').pop()
      if (filePath && fileName) {
        matches.push({ originalSrc, filePath, fileName })
      }
    }

    while ((match = attachmentTagRegex.exec(htmlString)) !== null) {
      const originalSrc = match[1]
      const filePath = getFilePathFromUrl(originalSrc)
      const fileName = filePath?.split('/').pop()
      if (filePath && fileName) {
        matches.push({ originalSrc, filePath, fileName })
      }
    }

    for (const { originalSrc, filePath, fileName } of matches) {
      const newFilePath = `${this.user.workspaceId}/${task_id}/comments/${commentId}/${fileName}`
      const supabaseActions = new SupabaseActions()

      const fileMetaData = await supabaseActions.getMetaData(filePath)
      createAttachmentPayloads.push(
        CreateAttachmentRequestSchema.parse({
          commentId: commentId,
          filePath: newFilePath,
          fileSize: fileMetaData?.size,
          fileType: fileMetaData?.contentType,
          fileName: getFileNameFromPath(newFilePath),
        }),
      )
      copyAttachmentPromises.push(supabaseActions.moveAttachment(filePath, newFilePath))
      newFilePaths.push({ originalSrc, newFilePath })
    }

    await Promise.all(copyAttachmentPromises)
    const attachmentService = new AttachmentsService(this.user)
    if (createAttachmentPayloads.length) {
      await attachmentService.createMultipleAttachments(createAttachmentPayloads)
    }

    const signedUrlPromises = newFilePaths.map(async ({ originalSrc, newFilePath }) => {
      const newUrl = await getSignedUrl(newFilePath)
      if (newUrl) {
        replacements.push({ originalSrc, newUrl })
      }
    })

    await Promise.all(signedUrlPromises)

    for (const { originalSrc, newUrl } of replacements) {
      htmlString = htmlString.replace(originalSrc, newUrl)
    }
    // const filePaths = newFilePaths.map(({ newFilePath }) => newFilePath)
    // await this.db.scrapMedia.updateMany({
    //   where: {
    //     filePath: {
    //       in: filePaths,
    //     },
    //   },
    //   data: {
    //     taskId: task_id,
    //   },
    // }) //todo: add support for commentId in scrapMedias.
    return htmlString
  } //todo: make this resuable since this is highly similar to what we are doing on tasks.

  async getAllComments(queryFilters: CommentsPublicFilterType): Promise<CommentWithAttachments[]> {
    const { parentId, taskId, limit, lastIdCursor, initiatorId } = queryFilters
    const where = {
      parentId,
      taskId,
      initiatorId,
      workspaceId: this.user.workspaceId,
    }

    const pagination = getBasicPaginationAttributes(limit, lastIdCursor)

    return await this.db.comment.findMany({
      where,
      ...pagination,
      include: { attachments: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async hasMoreCommentsAfterCursor(id: string, publicFilters: Partial<CommentsPublicFilterType>): Promise<boolean> {
    const newComment = await this.db.comment.findFirst({
      where: { ...publicFilters, workspaceId: this.user.workspaceId },
      cursor: { id },
      skip: 1,
      orderBy: { createdAt: 'desc' },
    })
    return !!newComment
  }
}
