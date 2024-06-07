import { NextRequest, NextResponse } from 'next/server'
import authenticate from '../core/utils/authenticate'
import { ActivityLogService } from '@api/activity-logs/services/activity-log.service'
import { IdParams } from '../core/types/api'
import httpStatus from 'http-status'
import { LogResponseSchema } from '@/types/dto/activity.dto'
import { z } from 'zod'

export const get = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)

  const activityService = new ActivityLogService(user)
  const log = await activityService.get(id)

  return NextResponse.json({ log: z.array(LogResponseSchema).parse(log) }, { status: httpStatus.OK })
}
