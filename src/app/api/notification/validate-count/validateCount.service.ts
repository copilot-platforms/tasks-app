import { DuplicateNotificationsQuerySchema } from '@/types/client-notifications'
import { getArrayDifference } from '@/utils/array'
import { bottleneck } from '@/utils/bottleneck'
import { CopilotAPI } from '@/utils/CopilotAPI'
import User from '@api/core/models/User.model'
import { NotificationService } from '@api/notification/notification.service'
import { TasksService } from '@api/tasks/tasks.service'
import { ClientNotification, Task } from '@prisma/client'
import { z } from 'zod'

export class ValidateCountService extends NotificationService {
  private readonly copilot: CopilotAPI
  constructor(readonly user: User) {
    super(user)
    this.copilot = new CopilotAPI(user.token)
  }

  /**
   * Queries for notifications from CopilotAPI and fixes it if not in sync with task count
   * @param {string} clientId - Copilot client id for which notification fix has to be done
   */
  async fixClientNotificationCount(clientId: string, companyId: string): Promise<void> {
    const notifications = await this.copilot.getNotifications(clientId, companyId, { limit: 1_000_000 })
    console.info('ValidateCount :: Total Copilot Notifications:', notifications.length)
    await this.validateWithTasks(
      clientId,
      companyId,
      notifications.map((n) => n.id),
    )
  }

  /**
   * Validates a list of Copilot notifications with tasks and task notifications
   * Creates / removes notifications from Copilot as necessary
   * @param {string[]} copilotNotificationIds - Notification Ids for a particular user for an app in Copilot
   */
  private async validateWithTasks(clientId: string, companyId: string, copilotNotificationIds: string[]): Promise<void> {
    const tasksService = new TasksService(this.user)
    const tasks = await tasksService.getAllTasks({
      companyId,
      showArchived: false,
      showUnarchived: true,
      showIncompleteOnly: true,
    })
    console.info('ValidateCount :: User tasks for company', companyId, ':', tasks.length)

    // Query all notifications triggered for a list of client/company tasks
    const appNotifications = await this.getAllForTasks(tasks)
    const appNotificationIds = appNotifications.map((n) => n.notificationId)
    console.info('ValidateCount :: App notifications', appNotifications.length)

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

    const newAppNotifications = await this.getAllForTasks(tasks)
    // Add robustness and legacy fixes by checking and fixing duplicate notifications for tasks
    if (tasks.length !== newAppNotifications.length || 1) {
      await this.removeDuplicateNotifications(clientId)
    }
  }

  private async removeDuplicateNotifications(clientId: string) {
    const queryResult = await this.db.$queryRaw`
        SELECT "taskId", count(*) as "rowCount", max("createdAt") AS "latestCreatedAt"
        FROM (
          SELECT "taskId", "clientId", "createdAt"
          FROM "ClientNotifications"
          WHERE "clientId" = ${clientId}::uuid 
            AND "deletedAt" IS NULL
        ) c
        GROUP BY "taskId"
        HAVING count(*) > 1
      `
    const duplicateNotifications = z.array(DuplicateNotificationsQuerySchema).parse(queryResult)
    const duplicateNotificationIds = await this.db.clientNotification.findMany({
      where: {
        OR: duplicateNotifications.map(({ taskId, latestCreatedAt }) => ({
          taskId,
          createdAt: {
            not: latestCreatedAt,
          },
        })),
      },
      select: { id: true, notificationId: true },
    })
    // Remove duplicate notifications from copilot
    const targetNotificationIds = duplicateNotificationIds.map(({ notificationId }) => notificationId)
    await this.copilot.bulkMarkNotificationsAsRead(targetNotificationIds)
    console.info('ValidateCount :: Removing duplicate notifications', targetNotificationIds.length)

    // Remove those duplicate notifications from db
    await this.db.clientNotification.deleteMany({
      where: {
        id: { in: duplicateNotificationIds.map(({ id }) => id) },
      },
    })
  }

  /**
   * Removes notifications present in db, which are not present in Copilot
   */
  private async removeOrphanNotificationsFromDb(appNotificationIds: string[], copilotNotificationIds: string[]) {
    console.info('ValidateCount :: Removing orphan notifications from db')
    // Delete orphan notifications (notifications in db that don't exist in Copilot)
    const orphanNotifications = appNotificationIds.filter((id) => !copilotNotificationIds.includes(id))
    if (orphanNotifications.length) {
      console.info('ValidateCount :: Found orphanNotifications', orphanNotifications.length)
      await this.db.clientNotification.deleteMany({ where: { notificationId: { in: orphanNotifications } } })
    }
  }

  /**
   * Cleans up and removes notifications present in Copilot, which are not present in db
   */
  private async removeOrphanNotificationsFromCopilot(appNotificationIds: string[], copilotNotificationIds: string[]) {
    // -- Handle copilotNotifications having notifications that appNotifications does not
    const extraCopilotNotifications = copilotNotificationIds.filter((id) => !appNotificationIds.includes(id))
    console.info('ValidateCount :: Removing orphan notifications from copilot', extraCopilotNotifications.length)
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
    console.info('ValidateCount :: Tasks with notifications', tasksWithNotifications.length)
    const tasksWithoutNotifications = tasks.filter((task) => !tasksWithNotifications.includes(task.id))
    console.info('ValidateCount :: Tasks without notifications', tasksWithoutNotifications.length)

    const createNotificationPromises = []
    // Create missing task notifications in Copilot
    for (const task of tasksWithoutNotifications) {
      createNotificationPromises.push(
        bottleneck.schedule(() => {
          console.info(`ValidateCount :: Creating missing notification for task ${task.id} - ${task.title}`)
          return this.copilot.createNotification({
            senderId: task.createdById,
            recipientId: clientId,
            recipientCompanyId: task.companyId || undefined,
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
        taskId: tasksWithoutNotifications[i].id,
        clientId,
        companyId: tasksWithoutNotifications[i].companyId,
      })
    }
    await this.db.clientNotification.createMany({
      data: newClientNotificationData,
    })
  }
}
