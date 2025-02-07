import { TaskNotificationsService } from '@/app/api/tasks/task-notifications.service'
import { TaskWithWorkflowState } from '@/types/db'
import User from '@api/core/models/User.model'
import { logger, task } from '@trigger.dev/sdk/v3'

type DeleteTaskNotificationPayload = {
  user: User
  task: TaskWithWorkflowState
}

export const deleteTaskNotifications = task({
  id: 'delete-task-notifications',
  machine: { preset: 'medium-1x' },

  run: async (payload: DeleteTaskNotificationPayload, { ctx }) => {
    logger.log('Deleting task notifications for:', { payload, ctx })

    const { task, user } = payload
    const taskNotificationsSevice = new TaskNotificationsService(user)
    await taskNotificationsSevice.removeDeletedTaskNotifications(task)

    return {
      message: `Deleted notifications for taskId ${task.id} successfully`,
    }
  },
})
