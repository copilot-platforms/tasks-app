import { TaskWithWorkflowState } from '@/types/db'
import User from '@api/core/models/User.model'
import { TaskNotificationsService } from '@api/tasks/task-notifications.service'
import { logger, task } from '@trigger.dev/sdk/v3'

type UpdateTaskNotificationPayload = {
  user: User
  prevTask: TaskWithWorkflowState
  updatedTask: TaskWithWorkflowState
}

export const sendTaskUpdateNotifications = task({
  id: 'send-task-update-notifications',
  machine: { preset: 'medium-1x' },
  queue: {
    concurrencyLimit: 5,
  },

  run: async (payload: UpdateTaskNotificationPayload, { ctx }) => {
    logger.log('Sending task update notifications for:', { payload, ctx })

    const { prevTask, updatedTask, user } = payload
    const taskNotificationsSevice = new TaskNotificationsService(user)
    await taskNotificationsSevice.sendTaskUpdateNotifications(prevTask, updatedTask)

    return {
      message: `Sent update notifications for taskId ${updatedTask.id} successfully`,
    }
  },
})
