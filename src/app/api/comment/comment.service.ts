import { CreateComment, UpdateComment } from '@/types/dto/comment.dto'
import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { UserAction } from '@api/core/types/user'
import { Resource } from '@api/core/types/api'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { ActivityLogger } from '@api/activity-logs/services/activity-logger.service'
import { ActivityType, AssigneeType, Comment, Task } from '@prisma/client'
import { CommentAddedSchema } from '@api/activity-logs/schemas/CommentAddedSchema'
import { NotificationService } from '@api/notification/notification.service'
import { NotificationTaskActions } from '@api/core/types/tasks'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'
import { NotificationCreatedResponseSchema } from '@/types/common'
import { z } from 'zod'

export class CommentService extends BaseService {
  private async sendCommentCreatedNotifications(task: Task, comment: Comment) {
    // If task is unassigned, there's nobody to send notifications to
    if (!task.assigneeId || !task.assigneeType) return

    const notificationService = new NotificationService(this.user)
    await this.handleCommentNotifications(task, comment, notificationService)
  }

  private handleCommentNotifications = async (task: Task, comment: Comment, notificationService: NotificationService) => {
    const copilot = new CopilotAPI(this.user.token)
    const { recipientIds: clientRecipientIds } = await notificationService.getNotificationParties(
      copilot,
      task,
      NotificationTaskActions.CommentToCU,
    )
    const { recipientIds: iuRecipientIds } = await notificationService.getNotificationParties(
      copilot,
      task,
      NotificationTaskActions.CommentToIU,
    )
    const filteredCUIds = clientRecipientIds.filter((id: string) => id !== comment.initiatorId)
    await notificationService.createBulkNotification(NotificationTaskActions.Commented, task, filteredCUIds, {
      email: true,
      disableInProduct: true,
      commentId: comment.id,
    })

    const filteredIUIds = iuRecipientIds.filter((id: string) => id !== comment.initiatorId)
    await notificationService.createBulkNotification(NotificationTaskActions.Commented, task, filteredIUIds, {
      email: false,
      disableInProduct: false,
      commentId: comment.id,
    })
  }

  async create(data: CreateComment) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.Comment)

    const initiatorId = z.string().parse(this.user.internalUserId || this.user.clientId)

    const task = await this.db.task.findFirst({
      where: {
        id: data.taskId,
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
      },
    })

    const activityLogger = new ActivityLogger({ taskId: data.taskId, user: this.user })

    await Promise.all([
      activityLogger.log(
        ActivityType.COMMENT_ADDED,
        CommentAddedSchema.parse({
          id: comment.id,
          content: comment.content,
          initiatorId,
          parentId: comment.parentId,
        }),
      ),
      this.sendCommentCreatedNotifications(task, comment),
    ])
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

    return await this.db.comment.delete({ where: { id } })
  }

  async update(id: string, data: UpdateComment) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Update, Resource.Comment)

    return await this.db.comment.update({
      where: { id },
      data: {
        ...data,
      },
    })
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

  async getReplies(commentIds: string[]) {
    return await this.db.comment.findMany({
      where: {
        parentId: { in: commentIds },
      },
      orderBy: { createdAt: 'asc' },
    })
  }
}
