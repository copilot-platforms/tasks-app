import { NextRequest, NextResponse } from 'next/server'
import { TasksService } from '@api/tasks/tasks.service'
import { CreateTaskRequestSchema, UpdateTaskRequestSchema } from '@/types/dto/tasks.dto'
import { IdParams } from '@api/core/types/api'
import httpStatus from 'http-status'
import authenticate from '@api/core/utils/authenticate'
import { unstable_noStore as noStore } from 'next/cache'
import { getBooleanQuery, getSearchParams } from '@/utils/request'

export const getTasks = async (req: NextRequest) => {
  noStore()
  const user = await authenticate(req)

  const { showArchived, showUnarchived } = getSearchParams(req.nextUrl.searchParams, ['showArchived', 'showUnarchived'])

  const tasksService = new TasksService(user)
  const tasks = await tasksService.getAllTasks({
    showUnarchived: getBooleanQuery(showUnarchived, true),
    showArchived: getBooleanQuery(showArchived, false),
  })

  return NextResponse.json({ tasks })
}

export const createTask = async (req: NextRequest) => {
  const user = await authenticate(req)

  const data = CreateTaskRequestSchema.parse(await req.json())
  const tasksService = new TasksService(user)
  const newTask = await tasksService.createTask(data)
  return NextResponse.json(newTask, { status: httpStatus.CREATED })
}

export const getTask = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)
  const tasksService = new TasksService(user)
  const task = await tasksService.getOneTask(id)
  const assignee = await tasksService.getTaskAssignee(task)
  return NextResponse.json({ task: { ...task, assignee } })
}

export const updateTask = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)

  const data = UpdateTaskRequestSchema.parse(await req.json())
  const tasksService = new TasksService(user)
  const updatedTask = await tasksService.updateOneTask(id, data)

  return NextResponse.json({ updatedTask })
}

export const deleteTask = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)

  const tasksService = new TasksService(user)
  await tasksService.deleteOneTask(id)
  return new NextResponse(null, { status: httpStatus.NO_CONTENT })
}

export const clientUpdateTask = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)
  const workflowStateId = req.nextUrl.searchParams.get('workflowStateId')
  const tasksService = new TasksService(user)
  const updatedTask = await tasksService.clientUpdateTask(id, workflowStateId)
  return NextResponse.json({ updatedTask })
}
