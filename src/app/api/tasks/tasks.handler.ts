import { NextRequest, NextResponse } from 'next/server'
import { TasksService } from './tasks.service'
import { NextFn, Params } from '@/lib/plumber/types'
import { AuthenticatedParams } from '../core/types/context'
import { Routes } from '../core/types/api'

export const getTasks = async (req: NextRequest, params?: Params, next?: NextFn) => {
  const { user } = params as AuthenticatedParams
  const tasksService = new TasksService()
  if (!user.can('read', Routes.Tasks)) {
    throw new APIError(401, 'You are not authorized to perform this action')
  }

  const tasks = tasksService.getAllTasks({
    workspaceId: user.workspaceId,
  })

  return NextResponse.json({ tasks })
}
