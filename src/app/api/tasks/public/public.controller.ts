import { defaultLimit } from '@/constants/public-api'
import { StateTypeSchema } from '@/types/common'
import { getSearchParams } from '@/utils/request'
import { IdParams } from '@api/core/types/api'
import authenticate from '@api/core/utils/authenticate'
import { PublicTaskSerializer } from '@api/tasks/public/public.serializer'
import { TasksService } from '@api/tasks/tasks.service'
import { decode, encode } from 'js-base64'
import { NextRequest, NextResponse } from 'next/server'

export const getAllTasksPublic = async (req: NextRequest) => {
  const user = await authenticate(req)

  const { parentTaskId, assigneeId, createdBy, status, limit, nextToken } = getSearchParams(req.nextUrl.searchParams, [
    'parentTaskId',
    'assigneeId',
    'createdBy',
    'status',
    'limit',
    'nextToken',
  ])
  const tasksService = new TasksService(user)
  const tasks = await tasksService.getAllTasks({
    fromPublicApi: true,
    showArchived: true,
    showUnarchived: true,
    all: !parentTaskId,
    assigneeId: assigneeId || undefined,
    createdById: createdBy || undefined,
    // Note - this technically messes up getting only parent tasks, but that doesn't seem to be in scope for API
    parentId: parentTaskId || undefined,
    workflowStateType: StateTypeSchema.optional().parse(status || undefined),
    limit: limit ? +limit : defaultLimit,
    lastIdCursor: nextToken ? decode(nextToken) : undefined,
  })

  const lastTaskId = tasks[tasks.length - 1]?.id
  // Hacky but works good enough 🤷‍♂️ Life is too short to dwell on an extra LIMIT 1 query
  const hasMoreTasks = lastTaskId ? await tasksService.hasMoreTasksAfterCursor(lastTaskId) : false
  const base64NextToken = hasMoreTasks ? encode(lastTaskId) : undefined

  return NextResponse.json({
    data: PublicTaskSerializer.serializeMany(tasks),
    nextToken: base64NextToken,
  })
}

export const getOneTaskPublic = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)
  const tasksService = new TasksService(user)
  const task = await tasksService.getOneTask(id)
  return NextResponse.json({ ...PublicTaskSerializer.serialize(task) })
}
