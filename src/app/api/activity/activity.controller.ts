import { NextRequest, NextResponse } from 'next/server'
import { ActivityLogger } from '../core/services/activityLog.service'
import { copilotAPIKey } from '@/config'
import APIError from '../core/exceptions/api'
import httpStatus from 'http-status'

export const createActivityLog = async (req: NextRequest, { params: { taskId } }: { params: { taskId: string } }) => {
  const apiKey = req.nextUrl.searchParams.get('apiKey')

  if (!apiKey || apiKey !== copilotAPIKey) {
    throw new APIError(httpStatus.UNAUTHORIZED, "You're not authorized to access this route!")
  }

  const data = await req.json()
  const activityLogger = new ActivityLogger({ taskId: taskId, user: data.user })
  await activityLogger.initiateLogging(data.task)

  return NextResponse.json({ status: httpStatus.CREATED })
}
