import { StateTypeSchema } from '@/types/common'
import { getSearchParams } from '@/utils/request'
import { IdParams } from '@api/core/types/api'
import authenticate from '@api/core/utils/authenticate'
import { PublicTaskSerializer } from '@api/tasks/public/public.serializer'
import { TasksService } from '@api/tasks/tasks.service'
import { NextRequest, NextResponse } from 'next/server'

export const getAllTasksPublic = async (req: NextRequest) => {
  const user = await authenticate(req)

  const { parentTaskId, assigneeId, createdBy, status } = getSearchParams(req.nextUrl.searchParams, [
    'parentTaskId',
    'assigneeId',
    'createdBy',
    'status',
  ])

  const tasksService = new TasksService(user)

  const tasks = await tasksService.getAllTasks({
    showArchived: true,
    showUnarchived: true,
    all: !parentTaskId,
    assigneeId: assigneeId || undefined,
    createdById: createdBy || undefined,
    // Note - this technically messes up getting only parent tasks, but that doesn't seem to be in scope here
    parentId: parentTaskId || undefined,
    workflowStateType: StateTypeSchema.optional().parse(status || undefined),
  })
  return NextResponse.json({ data: PublicTaskSerializer.serializeMany(tasks) })
}

export const getOneTaskPublic = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)
  const tasksService = new TasksService(user)
  const task = await tasksService.getOneTask(id)
  return NextResponse.json({ ...PublicTaskSerializer.serialize(task) })
}
