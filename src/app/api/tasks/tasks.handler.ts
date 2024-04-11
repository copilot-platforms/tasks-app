import { NextRequest, NextResponse } from 'next/server'
import { TasksService } from './tasks.service'
import { NextFn, Params } from '@/lib/plumber/types'
import { AuthenticatedParams } from '../core/types/context'

export const getTasks = async (req: NextRequest, params?: Params, next?: NextFn) => {
  console.log(params)
  const tasksService = new TasksService()
  const tasks = tasksService.getAllTasks({
    workspaceId: (params as AuthenticatedParams)?.currentUser.workspaceId as string,
  })

  return NextResponse.json({ tasks })
}
