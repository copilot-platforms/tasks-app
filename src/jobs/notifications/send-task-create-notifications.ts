import { TaskNotificationsService } from '@/app/api/tasks/task-notifications.service'
import { TaskWithWorkflowState } from '@/types/db'
import User from '@api/core/models/User.model'
import { logger, task } from '@trigger.dev/sdk/v3'

type CreateTaskNotificationPayload = {
  user: User
  task: TaskWithWorkflowState
}

export const sendTaskCreateNotifications = task({
  id: 'send-task-create-notifications',
  machine: { preset: 'medium-1x' },

  run: async (payload: CreateTaskNotificationPayload, { ctx }) => {
    logger.log('Sending task creation notifications for:', { payload, ctx })

    const { task, user } = payload
    const taskNotificationsSevice = new TaskNotificationsService(user)
    await taskNotificationsSevice.sendTaskCreateNotifications(task)

    return {
      message: `Sent create notifications for taskId ${task.id} successfully`,
    }
  },
})
