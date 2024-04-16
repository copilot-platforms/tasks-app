import { CopilotAPI } from '@/utils/CopilotAPI'
import { NextRequest } from 'next/server'
import User from '@api/core/models/User.model'
import { z } from 'zod'
import { TokenSchema } from '@/types/common'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'

/**
 * Token parser and authentication util
 *
 * `authenticate` takes in the current request, parses the "token" searchParam from it,
 * uses `CopilotAPI` to check if the user token is valid
 * and finally returns an instance of `User` that is associated with this request
 */
const authenticate = async (req: NextRequest) => {
  const token = req.nextUrl.searchParams.get('token')
  const tokenParsed = z.string().safeParse(token)
  if (!tokenParsed.success) {
    throw new APIError(httpStatus.UNAUTHORIZED, 'Please provide a valid token')
  }

  const copilotClient = new CopilotAPI(tokenParsed.data)
  const payload = TokenSchema.safeParse(await copilotClient.getTokenPayload())

  if (!payload.success) {
    throw new APIError(httpStatus.UNAUTHORIZED, 'Failed to authenticate token')
  }

  return new User(tokenParsed.data, payload.data)
}

export default authenticate
