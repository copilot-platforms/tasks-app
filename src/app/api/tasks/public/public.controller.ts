import { PublicTaskCreateDtoSchema } from '@/app/api/tasks/public/public.dto'
import { defaultLimit } from '@/constants/public-api'
import { StateTypeSchema } from '@/types/common'
import { getSearchParams } from '@/utils/request'
import { IdParams } from '@api/core/types/api'
import authenticate from '@api/core/utils/authenticate'
import { PublicTaskUpdateDtoSchema } from '@api/tasks/public/public.dto'
import { PublicTaskSerializer } from '@api/tasks/public/public.serializer'
import { TasksService } from '@api/tasks/tasks.service'
import { decode, encode } from 'js-base64'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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

export const updateTaskPublic = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)
  const data = PublicTaskUpdateDtoSchema.parse(await req.json())
  const tasksService = new TasksService(user)
  const updatedTask = await tasksService.updateOneTask(id, PublicTaskSerializer.deserializeUpdatePayload(data))
  return NextResponse.json(updatedTask)
}

export const deleteOneTaskPublic = async (req: NextRequest, { params: { id } }: IdParams) => {
  const recursive = req.nextUrl.searchParams.get('recursive')
  const user = await authenticate(req)
  const tasksService = new TasksService(user)
  const task = await tasksService.deleteOneTask(id, z.coerce.boolean().parse(recursive))
  return NextResponse.json({ ...PublicTaskSerializer.serialize(task) })
}

export const createTaskPublic = async (req: NextRequest) => {
  const user = await authenticate(req)
  const data = PublicTaskCreateDtoSchema.parse(await req.json())
  const createPayload = await PublicTaskSerializer.deserializeCreatePayload(data, user.workspaceId)
  const tasksService = new TasksService(user)
  const newTask = await tasksService.createTask(createPayload)
  return NextResponse.json(PublicTaskSerializer.serialize(newTask), { status: 200 })
}
