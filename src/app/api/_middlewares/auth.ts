import { APIError } from '@/exceptions/api'
import { NextFn } from '@/lib/plumber/types'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { ApiError } from 'next/dist/server/api-utils'
import { NextRequest } from 'next/server'
import { z } from 'zod'

export const authenticateToken = async (req: NextRequest, _: any, next: NextFn) => {
  const token = req.nextUrl.searchParams.get('token')
  const tokenParsed = z.string().safeParse(token)
  if (!tokenParsed.success) {
    throw new APIError(403, 'Please provide a valid auth token')
  }

  const copilotClient = new CopilotAPI(z.string().parse(tokenParsed.data))
  const tokenPayload = await copilotClient.getTokenPayload()
  if (!tokenPayload || !tokenPayload.workspaceId) {
    throw new ApiError(403, 'Failed to authenticate token payload')
  }

  const role = tokenPayload.clientId ? 'client' : 'iu'

  return await next({ tokenPayload, role })
}
