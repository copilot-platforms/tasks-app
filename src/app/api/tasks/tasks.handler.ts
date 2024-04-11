import { NextFn } from '@/lib/plumber/types'
import { AuthenticatedParams, AuthenticatedPipeParams } from '@/types/api'
import { NextRequest, NextResponse } from 'next/server'
import { TasksService } from './tasks.service'

export const index = async (req: NextRequest, { pipeParams }: AuthenticatedParams, next: NextFn) => {
  const { role, tokenPayload } = pipeParams

  const tasksService = new TasksService()
  const tasks = tasksService.getTasksForUserRole(role, tokenPayload)

  return NextResponse.json({ tasks })
}

export const create = async (req: NextRequest, { pipeParams }: AuthenticatedParams, next: NextFn) => {}
