import { NextRequest, NextResponse } from 'next/server'
import authenticate from '../core/utils/authenticate'
import { ActivityLogger } from './activity.service'
import { IdParams } from '../core/types/api'
import httpStatus from 'http-status'
import { LogSchema } from '@/types/dto/activity.dto'

export const getActivityWithComment = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)

  const activityService = new ActivityLogger({ taskId: id, user })

  const log = await activityService.getActivityWithComment()

  return NextResponse.json({ log: LogSchema.parse(log) }, { status: httpStatus.OK })
}
