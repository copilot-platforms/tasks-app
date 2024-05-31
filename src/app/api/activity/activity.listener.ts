import { EventEmitter } from 'stream'
import User from '../core/models/User.model'
import { UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { Task } from '@prisma/client'
import { ActivityLogger } from './activityLogger.service'

export const activityEvents = new EventEmitter()

activityEvents.on('post', async (taskId: string, user: User) => {
  const activityLog = new ActivityLogger({ taskId, user })
  await activityLog.createTaskLog()
})

activityEvents.on('patch', async (taskId: string, user: User, payload: UpdateTaskRequest, prevTask: Task) => {
  console.log('from listener: payload', payload.assigneeId)
  console.log('listener: prevTask', prevTask.assigneeId)
  const activityLogger = new ActivityLogger({ taskId, user: user })
  await activityLogger.initiateLogging(payload, prevTask)
})
