import { NotificationCreatedResponse } from '@/types/common'
import { CopilotAPI } from '@/utils/CopilotAPI'
import APIError from '@api/core/exceptions/api'
import { NotificationService } from '@api/notification/notification.service'
import httpStatus, { extra } from 'http-status'
import { z } from 'zod'
import { TasksService } from '../../tasks/tasks.service'
import { UserRole } from '../../core/types/user'
import { bottleneck } from '@/utils/bottleneck'

export class ValidateCountService extends NotificationService {
  // Queries for notifications from CopilotAPI and fixes it if not in sync with task count
  async fixClientNotificationCount(): Promise<void> {
    const userId = z.string().safeParse(this.user.clientId)
    if (userId.error) {
      throw new APIError(httpStatus.UNAUTHORIZED, 'Only client users are allowed to access this feature')
    }
    const clientId = userId.data

    const copilot = new CopilotAPI(this.user.token)
    const notifications = await copilot.getNotifications(clientId, { limit: 1_000_000 })

    await this.validateWithTasks(
      copilot,
      notifications.map((n) => n.id),
    )
  }

  /**
   * Validates task count with notification count, and creates / removes notifications as necessary
   */
  private async validateWithTasks(copilot: CopilotAPI, copilotNotificationIds: string[]): Promise<void> {
    const tasksService = new TasksService(this.user)
    const tasks = await tasksService.getAllTasks()
    console.log('t', tasks)
    const recipientId = z.string().parse(this.user.clientId)

    const appNotifications = await this.getAllForTasks<UserRole.Client>(tasks)
    const appNotificationIds = appNotifications.map((n) => n.notificationId)
    console.log('copilot', copilotNotificationIds)
    console.log('app', appNotificationIds)

    // Delete orphan notifications (notifications in db that don't exist in Copilot)
    const orphanNotifications = appNotificationIds.filter((id) => !copilotNotificationIds.includes(id))
    if (orphanNotifications.length) {
      console.log('or', orphanNotifications)
      await this.db.clientNotification.deleteMany({ where: { id: { in: zombieNotifications } } })
    }
    return

    // // --- Main issue: notifications not in copilot for existing tasks
    // if (tasks.length > copilotNotificationIds.length) {
    //   const tasksWithoutNotifications = tasks.filter((task) => !tasksWithNotifications.includes(task.id))
    //   const createNotificationPromises = []
    //   for (const task of tasksWithoutNotifications) {
    //     createNotificationPromises.push(
    //       bottleneck.schedule(() => {
    //         console.info(`Creating missing notification for task ${task.id} - ${task.title}`)
    //         return copilot.createNotification({
    //           senderId: task.createdById,
    //           recipientId,
    //           deliveryTargets: {
    //             inProduct: {
    //               // doesn't matter what you add here since notification details cannot be viewed
    //               title: task.id,
    //             },
    //           },
    //         })
    //       }),
    //     )
    //   }
    //   const newNotifications = await Promise.all(createNotificationPromises)
    //   const newClientNotificationData = []
    //   for (const i in newNotifications) {
    //     newClientNotificationData.push({
    //       notificationId: newNotifications[i].id,
    //       taskId: tasks[i].id,
    //       clientId: recipientId,
    //     })
    //   }
    //   await this.db.clientNotification.createMany({
    //     data: newClientNotificationData,
    //   })
    // }
    //
    // // -- Handle copilotNotifications having notifications that appNotifications does not
    // const extraCopilotNotifications = copilotNotificationIds.filter((id) => !appNotificationIds.includes(id))
    // if (extraCopilotNotifications.length) {
    //   console.log("There are notification in Copilot that aren't in db. Fixing...")
    //   await this.bulkMarkAsRead(extraCopilotNotifications)
    // }
  }
}
