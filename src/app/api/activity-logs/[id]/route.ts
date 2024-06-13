import { NextRequest, NextResponse } from 'next/server'
import authenticate from '../../core/utils/authenticate'
import { ActivityLogService } from '../services/activity-log.service'
import { IdParams } from '../../core/types/api'

export const GET = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)

  const activityLogger = new ActivityLogService(user)

  const activity = await activityLogger.get(id)

  return NextResponse.json({ activity })
}
