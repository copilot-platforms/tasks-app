import { TaskWithWorkflowState } from '@/types/db'
import User from '@api/core/models/User.model'
import { TaskNotificationsService } from '@api/tasks/task-notifications.service'
import { WorkflowState } from '@prisma/client'
import { logger, task } from '@trigger.dev/sdk/v3'

type ClientTaskUpdateNotificationPayload = {
  user: User
  prevTask: TaskWithWorkflowState
  updatedTask: TaskWithWorkflowState
  updatedWorkflowState: WorkflowState | null
}

export const sendClientUpdateTaskNotifications = task({
  id: 'send-client-task-notifications',
  machine: {
    preset: 'medium-1x',
  },
  queue: {
    concurrencyLimit: 5,
  },

  run: async (payload: ClientTaskUpdateNotificationPayload, { ctx }) => {
    logger.log('Deleting task notifications for:', { payload, ctx })

    const { prevTask, updatedTask, updatedWorkflowState, user } = payload
    const taskNotificationsSevice = new TaskNotificationsService(user)
    await taskNotificationsSevice.sendClientUpdateTaskNotifications(prevTask, updatedTask, updatedWorkflowState)

    return {
      message: `Handled client task update notifications for taskId ${updatedTask.id} successfully`,
    }
  },
})
