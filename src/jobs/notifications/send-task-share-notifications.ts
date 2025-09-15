import { TaskNotificationsService } from '@/app/api/tasks/task-notifications.service'
import { TaskWithWorkflowState } from '@/types/db'
import User from '@api/core/models/User.model'
import { logger, task } from '@trigger.dev/sdk/v3'

type CreateTaskShareNotificationPayload = {
  user: User
  task: TaskWithWorkflowState
}

export const sendTaskShareNotifications = task({
  id: 'send-task-share-notifications',
  machine: { preset: 'medium-1x' },
  queue: {
    concurrencyLimit: 5,
  },

  run: async (payload: CreateTaskShareNotificationPayload, { ctx }) => {
    logger.log('Sending task sharing notifications for:', { payload, ctx })

    const { task, user } = payload
    const taskNotificationsSevice = new TaskNotificationsService(user)
    await taskNotificationsSevice.sendTaskSharedNotifications(task)

    return {
      message: `Sent share notifications for taskId ${task.id} successfully`,
    }
  },
})
