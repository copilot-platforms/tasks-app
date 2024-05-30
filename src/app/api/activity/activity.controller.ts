import { NextRequest, NextResponse } from 'next/server'
import { ActivityLogger } from '@/app/api/activity/activityLogger.service'
import httpStatus from 'http-status'
import { DataSchema } from '@/types/interfaces'

export const createActivityLog = async (req: NextRequest, { params: { taskId } }: { params: { taskId: string } }) => {
  const data = DataSchema.parse(await req.json())
  const activityLogger = new ActivityLogger({ taskId: taskId, user: data.user })
  await activityLogger.initiateLogging(data.task)

  return NextResponse.json({ status: httpStatus.CREATED })
}
