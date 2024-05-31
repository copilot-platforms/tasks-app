import { EventEmitter } from 'node:events'
import User from '../core/models/User.model'
import { UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { Task } from '@prisma/client'
import { ActivityLogger } from './activityLogger.service'

export enum ActivityEventType {
  POST,
  PATCH,
}

export const activityEvents = new EventEmitter()

activityEvents.on(
  'logActivity',
  async (taskId: string, user: User, eventType: ActivityEventType, payload: UpdateTaskRequest, prevTask: Task) => {
    if (eventType === ActivityEventType.POST) {
      const activityLog = new ActivityLogger({ taskId, user })
      await activityLog.createTaskLog()
    }

    if (eventType === ActivityEventType.PATCH) {
      console.log('patch is running')
      const activityLogger = new ActivityLogger({ taskId, user: user })
      await activityLogger.initiateLogging(payload, prevTask)
    }
  },
)
