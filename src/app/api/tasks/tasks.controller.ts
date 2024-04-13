import { NextRequest, NextResponse } from 'next/server'
import { TasksService } from '@api/tasks/tasks.service'
import AuthService from '@api/core/services/auth.service'

export const getTasks = async (req: NextRequest) => {
  const user = await AuthService.authenticate(req)

  const tasksService = new TasksService()
  const tasks = tasksService.getAllTasks(user)

  return NextResponse.json({ tasks })
}
