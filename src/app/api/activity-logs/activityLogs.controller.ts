import { ActivityLogsService } from '@api/activity-logs/activityLogs.service'
import { IdParams } from '@api/core/types/api'
import authenticate from '@api/core/utils/authenticate'
import { TasksService } from '@api/tasks/tasks.service'
import { NextRequest, NextResponse } from 'next/server'

export const getActivityLogsForTask = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)
  const tasksService = new TasksService(user)
  const task = await tasksService.getOneTask(id)
  const activityLogsService = new ActivityLogsService(user, task)

  return NextResponse.json({ data: await activityLogsService.getAllLogs() })
}
