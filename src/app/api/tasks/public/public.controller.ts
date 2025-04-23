import { IdParams } from '@api/core/types/api'
import authenticate from '@api/core/utils/authenticate'
import { PublicTaskSerializer } from '@api/tasks/public/public.serializer'
import { TasksService } from '@api/tasks/tasks.service'
import { NextRequest, NextResponse } from 'next/server'

export const getOneTaskPublic = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)
  const tasksService = new TasksService(user)
  const task = await tasksService.getOneTask(id)
  return NextResponse.json({ ...PublicTaskSerializer.serialize(task) })
}
