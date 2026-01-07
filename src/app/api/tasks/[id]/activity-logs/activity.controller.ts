import { getSearchParams } from '@/utils/request'
import { ActivityLogService } from '@api/activity-logs/services/activity-log.service'
import { IdParams } from '@api/core/types/api'
import authenticate from '@api/core/utils/authenticate'
import httpStatus from 'http-status'
import { NextRequest, NextResponse } from 'next/server'

export const get = async (req: NextRequest, { params }: IdParams) => {
  const { id } = await params
  const user = await authenticate(req)

  const { expandComments } = getSearchParams(req.nextUrl.searchParams, ['expandComments'])
  const activityLogService = new ActivityLogService(user)
  const logs = await activityLogService.get(id, { expandComments: expandComments?.split(',') })

  return NextResponse.json(
    {
      data: logs,
    },
    { status: httpStatus.OK },
  )
}
