import { NextRequest, NextResponse } from 'next/server'
import authenticate from '@api/core/utils/authenticate'
import { ActivityLogService } from '@api/activity-logs/services/activity-log.service'
import { IdParams } from '@api/core/types/api'
import { unstable_noStore as noStore } from 'next/cache'

export const GET = async (req: NextRequest, { params: { id } }: IdParams) => {
  noStore()
  const user = await authenticate(req)

  const activityLogger = new ActivityLogService(user)

  const activity = await activityLogger.get(id)

  return NextResponse.json({ activity })
}
