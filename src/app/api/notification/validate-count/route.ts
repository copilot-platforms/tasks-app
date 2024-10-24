import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { NextRequest, NextResponse } from 'next/server'
import authenticate from '../../core/utils/authenticate'

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await authenticate(req)
  return NextResponse.json({})
})
