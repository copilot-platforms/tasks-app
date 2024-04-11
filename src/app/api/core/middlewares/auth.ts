import { NextFn, Params } from '@/lib/plumber/types'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import User from '../models/User.model'

export const authenticateUser = async (req: NextRequest, params?: Params, next?: NextFn) => {
  const token = req.nextUrl.searchParams.get('token')
  const tokenParsed = z.string().safeParse(token)
  if (!tokenParsed.success) {
    throw new APIError(401, 'Please provide a valid token')
  }

  const copilotClient = new CopilotAPI(tokenParsed.data)
  const payload = await copilotClient.getTokenPayload()

  if (!payload || !payload.workspaceId) {
    throw new APIError(401, 'Failed to authenticate token')
  }

  const currentUser = new User(tokenParsed.data, payload)

  return await next?.({ currentUser })
}
