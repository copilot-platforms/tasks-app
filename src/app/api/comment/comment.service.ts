import { CreateComment, UpdateComment } from '@/types/dto/comment.dto'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { CommentAddedSchema } from '@api/activity-logs/schemas/CommentAddedSchema'
import { ActivityLogger } from '@api/activity-logs/services/activity-logger.service'
import APIError from '@api/core/exceptions/api'
import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { NotificationTaskActions } from '@api/core/types/tasks'
import { UserAction } from '@api/core/types/user'
import { NotificationService } from '@api/notification/notification.service'
import { TasksService } from '@api/tasks/tasks.service'
import { ActivityType, Comment, Task } from '@prisma/client'
import httpStatus from 'http-status'
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

    const filteredCUIds = clientRecipientIds.filter((id: string) => id !== comment.initiatorId)
    console.info('creating notifications for CUS', filteredCUIds)
    await notificationService.createBulkNotification(NotificationTaskActions.Commented, task, filteredCUIds, {
      email: true,
      disableInProduct: true,
      commentId: comment.id,
    })

    const { recipientIds: iuRecipientIds } = await notificationService.getNotificationParties(
      copilot,
      task,
      NotificationTaskActions.CommentToIU,
    )

    const filteredIUIds = iuRecipientIds.filter((id: string) => id !== comment.initiatorId)
    console.info('creating notifications for IUs', filteredIUIds)
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
    const logActivity = activityLogger.log(
      ActivityType.COMMENT_ADDED,
      CommentAddedSchema.parse({
        id: comment.id,
        content: comment.content,
        initiatorId,
        parentId: comment.parentId,
      }),
    )

    const sendCommentCreatedNotifications = this.sendCommentCreatedNotifications(task, comment)

    await Promise.all([logActivity, sendCommentCreatedNotifications])
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

  async getReplies(commentIds: string[]) {
    return await this.db.comment.findMany({
      where: {
        parentId: { in: commentIds },
      },
      orderBy: { createdAt: 'asc' },
    })
  }
}
