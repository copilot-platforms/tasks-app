import { getArrayDifference } from '@/utils/array'
import { bottleneck } from '@/utils/bottleneck'
import { CopilotAPI } from '@/utils/CopilotAPI'
import User from '@api/core/models/User.model'
import { UserRole } from '@api/core/types/user'
import { NotificationService } from '@api/notification/notification.service'
import { TasksService } from '@api/tasks/tasks.service'
import { ClientNotification, Task } from '@prisma/client'

export class ValidateCountService extends NotificationService {
  private readonly copilot: CopilotAPI
  constructor(user: User) {
    super(user)
    this.copilot = new CopilotAPI(user.token)
  }

  /**
   * Queries for notifications from CopilotAPI and fixes it if not in sync with task count
   * @param {string} clientId - Copilot client id for which notification fix has to be done
   */
  async fixClientNotificationCount(clientId: string): Promise<void> {
    const notifications = await this.copilot.getNotifications(clientId, { limit: 1_000_000 })
    await this.validateWithTasks(
      clientId,
      notifications.map((n) => n.id),
    )
  }

  /**
   * Validates a list of Copilot notifications with tasks and task notifications
   * Creates / removes notifications from Copilot as necessary
   * @param {string[]} copilotNotificationIds - Notification Ids for a particular user for an app in Copilot
   */
  private async validateWithTasks(clientId: string, copilotNotificationIds: string[]): Promise<void> {
    const tasksService = new TasksService(this.user)
    const tasks = await tasksService.getAllTasks()

    // Query all notifications triggered for a list of client/company tasks
    const appNotifications = await this.getAllForTasks(tasks)
    const appNotificationIds = appNotifications.map((n) => n.notificationId)

    if (getArrayDifference(appNotificationIds, copilotNotificationIds).length) {
      await this.removeOrphanNotificationsFromDb(appNotificationIds, copilotNotificationIds)
    }

    if (tasks.length !== copilotNotificationIds.length) {
      await this.addMissingNotifications(tasks, clientId, appNotifications)
    }

    // Do this after fixing everything else to avoid removing necessary notifications
    if (getArrayDifference(copilotNotificationIds, appNotificationIds).length) {
      await this.removeOrphanNotificationsFromCopilot(appNotificationIds, copilotNotificationIds)
    }
  }

  /**
   * Removes notifications present in db, which are not present in Copilot
   */
  private async removeOrphanNotificationsFromDb(appNotificationIds: string[], copilotNotificationIds: string[]) {
    console.info('Removing orphan notifications from db')
    // Delete orphan notifications (notifications in db that don't exist in Copilot)
    const orphanNotifications = appNotificationIds.filter((id) => !copilotNotificationIds.includes(id))
    if (orphanNotifications.length) {
      await this.db.clientNotification.deleteMany({ where: { notificationId: { in: orphanNotifications } } })
    }
  }

  /**
   * Cleans up and removes notifications present in Copilot, which are not present in db
   */
  private async removeOrphanNotificationsFromCopilot(appNotificationIds: string[], copilotNotificationIds: string[]) {
    console.info('Removing orphan notifications from copilot')
    // -- Handle copilotNotifications having notifications that appNotifications does not
    const extraCopilotNotifications = copilotNotificationIds.filter((id) => !appNotificationIds.includes(id))
    if (extraCopilotNotifications.length) {
      await this.bulkMarkAsRead(extraCopilotNotifications)
    }
  }

  /**
   * Bulk-adds missing task notifications to Copilot client for tasks which are present in Tasks table
   * but does not have an associated notification
   */
  private async addMissingNotifications(tasks: Task[], clientId: string, appNotifications: ClientNotification[]) {
    // First create missing notifications in Copilot in-product
    const tasksWithNotifications = appNotifications.map((n: any) => n.taskId)
    const tasksWithoutNotifications = tasks.filter((task) => !tasksWithNotifications.includes(task.id))
    const createNotificationPromises = []
    for (const task of tasksWithoutNotifications) {
      createNotificationPromises.push(
        bottleneck.schedule(() => {
          console.info(`Creating missing notification for task ${task.id} - ${task.title}`)
          return this.copilot.createNotification({
            senderId: task.createdById,
            recipientId: clientId,
            deliveryTargets: {
              inProduct: {
                // doesn't matter what you add here since notification details cannot be viewed
                title: task.id,
              },
            },
          })
        }),
      )
    }
    const newNotifications = await Promise.all(createNotificationPromises)
    // Now track those to ClientNotifications table
    const newClientNotificationData = []
    for (const i in newNotifications) {
      newClientNotificationData.push({
        notificationId: newNotifications[i].id,
        taskId: tasks[i].id,
        clientId,
      })
    }
    await this.db.clientNotification.createMany({
      data: newClientNotificationData,
    })
  }
}
