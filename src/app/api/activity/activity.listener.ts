import { EventEmitter } from 'node:events'
import User from '../core/models/User.model'
import { UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { Task } from '@prisma/client'
import { ActivityLogger } from './activity.service'

export const activityEvents = new EventEmitter()

activityEvents.on('post', async (taskId: string, user: User) => {
  const activityLog = new ActivityLogger({ taskId, user })
  await activityLog.createTaskLog()
})

activityEvents.on('patch', async (taskId: string, user: User, payload: UpdateTaskRequest, prevTask: Task) => {
  const activityLogger = new ActivityLogger({ taskId, user: user })
  await activityLogger.initiateLogging(payload, prevTask)
})
