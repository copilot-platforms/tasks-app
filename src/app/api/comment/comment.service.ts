import { CreateComment, UpdateComment } from '@/types/dto/comment.dto'
import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { UserAction } from '@api/core/types/user'
import { Resource } from '@api/core/types/api'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { ActivityLogger } from '@api/activity-logs/services/activity-logger.service'
import { ActivityType, AssigneeType, Task } from '@prisma/client'
import { CommentAddedSchema } from '@api/activity-logs/schemas/CommentAddedSchema'
import { NotificationService } from '@api/notification/notification.service'
import { NotificationTaskActions } from '@api/core/types/tasks'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'
import { NotificationCreatedResponseSchema } from '@/types/common'

export class CommentService extends BaseService {
  async create(data: CreateComment) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.Comment)

    const copilotUtils = new CopilotAPI(this.user.token)
    const userInfo = await copilotUtils.me()

    if (!userInfo) {
      throw new APIError(httpStatus.NOT_FOUND, `User not found for token ${this.user.token}`)
    }

    const comment = await this.db.comment.create({
      data: {
        content: data.content,
        taskId: data.taskId,
        parentId: data.parentId,
        workspaceId: this.user.workspaceId,
        initiatorId: userInfo.id,
      },
    })

    const activityLogger = new ActivityLogger({ taskId: data.taskId, user: this.user })
    await activityLogger.log(
      ActivityType.COMMENT_ADDED,
      CommentAddedSchema.parse({
        id: comment.id,
        content: comment.content,
        initiatorId: userInfo.id,
        parentId: comment.parentId,
      }),
    )

    if (comment) {
      const task = await this.db.task.findFirst({
        where: {
          id: data.taskId,
        },
      })

      if (!task) {
        throw new APIError(httpStatus.NOT_FOUND, `Notification not created because task not found with id: ${data.taskId}`)
      }
      const notificationService = new NotificationService(this.user)
      await this.sendCommentCreateNotifications(task, userInfo.id)
      if (data.mentions) {
        await notificationService.createBulkNotification(NotificationTaskActions.Mentioned, task, data.mentions)
      }
    }

    return comment
  }

  async sendCommentCreateNotifications(task: Task, createdBy: string) {
    // If task is unassigned, there's nobody to send notifications to
    if (!task.assigneeId) return

    // If new task having the comment is assigned to someone (IU / Client / Company), send proper notification + email to them
    const notificationService = new NotificationService(this.user)

    // If comment is added by the same person that is assigned to the task, no need to notify
    if (task.assigneeId === createdBy) {
      if (task.assigneeType === AssigneeType.company) {
        await this.sendCompanyCommentNotifications(task, notificationService, createdBy)
      }
      return
    }

    const sendTaskNotifications =
      task.assigneeType === AssigneeType.company ? this.sendCompanyCommentNotifications : this.sendUserCommentNotification
    await sendTaskNotifications(task, notificationService)
  }

  private sendCompanyCommentNotifications = async (
    task: Task,
    notificationService: NotificationService,
    createdBy?: string,
  ) => {
    const copilot = new CopilotAPI(this.user.token)
    const { recipientIds } = await notificationService.getNotificationParties(
      copilot,
      task,
      NotificationTaskActions.AssignedToCompany,
    )
    // Remove createdBy from recipientIds if someone from the company has created the comment
    const filteredRecipientIds = createdBy ? recipientIds.filter((id: string) => id !== createdBy) : recipientIds
    const notifications = await notificationService.createBulkNotification(
      NotificationTaskActions.Commented,
      task,
      filteredRecipientIds,
      { email: true },
    )

    // This is a hacky way to bulk create ClientNotifications for all company members.
    if (notifications) {
      const notificationPromises = []
      for (let i = 0; i < notifications.length; i++) {
        // Basically we are treating an individual company member as a client recipient for a notification
        // For each loop we are considering a separate task where that particular member is the assignee
        notificationPromises.push(
          notificationService.addToClientNotifications(
            { ...task, assigneeId: filteredRecipientIds[0], assigneeType: AssigneeType.client },
            notifications[i],
          ),
        )
      }
      await Promise.all(notificationPromises)
    }
  }

  private async sendUserCommentNotification(task: Task, notificationService: NotificationService) {
    const notification = await notificationService.create(
      //! In future when reassignment is supported, change this logic to support reassigned to client as well
      NotificationTaskActions.Commented,
      task,
      {
        email: task.assigneeType === AssigneeType.internalUser,
      },
    )
    // Create a new entry in ClientNotifications table so we can mark as read on
    // behalf of client later

    if (!notification) {
      console.error('Notification failed to trigger for task:', task)
    }
    if (task.assigneeType === AssigneeType.client) {
      await notificationService.addToClientNotifications(task, NotificationCreatedResponseSchema.parse(notification))
    }
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
