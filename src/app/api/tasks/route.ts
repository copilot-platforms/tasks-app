import { NextRequest, NextResponse } from 'next/server'
import { TasksService } from './tasks.service'

export const GET = (req: NextRequest) => {
  const tasksService = new TasksService()
  const tasks = tasksService.getAllTasks()
  return NextResponse.json({ tasks })
}
