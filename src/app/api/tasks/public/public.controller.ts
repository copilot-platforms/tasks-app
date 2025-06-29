import { publicTaskCreateDtoSchemaFactory, StatusSchema } from '@/app/api/tasks/public/public.dto'
import { defaultLimit } from '@/constants/public-api'
import { getSearchParams } from '@/utils/request'
import { IdParams } from '@api/core/types/api'
import authenticate from '@api/core/utils/authenticate'
import { PublicTaskUpdateDtoSchema } from '@api/tasks/public/public.dto'
import { PublicTaskSerializer, workflowStateTypeMap } from '@api/tasks/public/public.serializer'
import { TasksService } from '@api/tasks/tasks.service'
import { decode, encode } from 'js-base64'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const getAllTasksPublic = async (req: NextRequest) => {
  const user = await authenticate(req)

  const { parentTaskId, internalUserId, clientId, companyId, createdBy, status, limit, nextToken } = getSearchParams(
    req.nextUrl.searchParams,
    ['parentTaskId', 'internalUserId', 'clientId', 'companyId', 'createdBy', 'status', 'limit', 'nextToken'],
  )

  const statusParsed = StatusSchema.optional().parse(status || undefined)
  const workflowStateType = statusParsed && workflowStateTypeMap[statusParsed]

  const publicFilters: Partial<Parameters<TasksService['getAllTasks']>[0]> = {
    internalUserId: internalUserId || undefined,
    clientId: clientId || undefined,
    companyId: companyId || undefined,
    createdById: createdBy || undefined,
    // Note - this technically messes up getting only parent tasks, but that doesn't seem to be in scope for API
    parentId: (parentTaskId === 'null' ? null : parentTaskId) || undefined,
    workflowState: workflowStateType && { type: workflowStateType },
  }

  const tasksService = new TasksService({ user })
  const tasks = await tasksService.getAllTasks({
    fromPublicApi: true,
    showArchived: true,
    showUnarchived: true,
    all: !parentTaskId,
    limit: limit ? +limit : defaultLimit,
    lastIdCursor: nextToken ? decode(nextToken) : undefined,
    ...publicFilters,
  })

  const lastTaskId = tasks[tasks.length - 1]?.id
  const hasMoreTasks = lastTaskId ? await tasksService.hasMoreTasksAfterCursor(lastTaskId, publicFilters) : false
  const base64NextToken = hasMoreTasks ? encode(lastTaskId) : undefined

  return NextResponse.json({
    data: PublicTaskSerializer.serializeMany(tasks),
    nextToken: base64NextToken,
  })
}

export const getOneTaskPublic = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)
  const tasksService = new TasksService({ user })
  const task = await tasksService.getOneTask(id, true) //from public API is true
  return NextResponse.json(PublicTaskSerializer.serialize(task))
}

export const createTaskPublic = async (req: NextRequest) => {
  const user = await authenticate(req)
  const data = await publicTaskCreateDtoSchemaFactory(user.token).parseAsync(await req.json())
  const createPayload = await PublicTaskSerializer.deserializeCreatePayload(data, user.workspaceId)
  const tasksService = new TasksService({ user })
  const newTask = await tasksService.createTask(createPayload, { isPublicApi: true })

  return NextResponse.json(PublicTaskSerializer.serialize(newTask))
}

export const updateTaskPublic = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)
  const data = PublicTaskUpdateDtoSchema.parse(await req.json())

  const tasksService = new TasksService({ user })
  const updatePayload = await PublicTaskSerializer.deserializeUpdatePayload(data, user.workspaceId)
  const updatedTask = await tasksService.updateOneTask(id, updatePayload, { isPublicApi: true })

  return NextResponse.json(PublicTaskSerializer.serialize(updatedTask))
}

export const deleteOneTaskPublic = async (req: NextRequest, { params: { id } }: IdParams) => {
  const recursive = req.nextUrl.searchParams.get('recursive')
  const user = await authenticate(req)
  const tasksService = new TasksService({ user })
  const task = await tasksService.deleteOneTask(id, z.coerce.boolean().parse(recursive))
  return NextResponse.json({ ...PublicTaskSerializer.serialize(task) })
}
