import { TaskWithWorkflowState } from '@/types/db'
import User from '@api/core/models/User.model'
import { TaskNotificationsService } from '@api/tasks/task-notifications.service'
import { logger, task } from '@trigger.dev/sdk/v3'

export const sendTaskCreateNotifications = task({
  id: 'send-task-create-notifications',
  maxDuration: 300, // seconds

  run: async (payload: { user: User; task: TaskWithWorkflowState }, { ctx }) => {
    logger.log('Processing `send-task-create-notifications`', { payload, ctx })

    const { user, task } = payload
    const taskNotificationsSevice = new TaskNotificationsService(user)
    const data = await taskNotificationsSevice.sendTaskCreateNotifications(task)

    return {
      message: 'Processed task create notification successfully',
      data,
    }
  },
})
