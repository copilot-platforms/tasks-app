import { NextRequest, NextResponse } from 'next/server'
import authenticate from '@api/core/utils/authenticate'
import { ActivityLogService } from '@api/activity-logs/services/activity-log.service'
import { IdParams } from '@api/core/types/api'
import httpStatus from 'http-status'

export const get = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)

  const activityLogService = new ActivityLogService(user)
  const logs = await activityLogService.get(id)

  return NextResponse.json(
    {
      data: logs,
    },
    { status: httpStatus.OK },
  )
}
