import { CopilotAPI } from '@/utils/CopilotAPI'
import { NextRequest } from 'next/server'
import User from '@api/core/models/User.model'
import { z } from 'zod'
import { TokenSchema } from '@/types/common'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'
import { withRetry } from './withRetry'

export const _authenticateWithToken = async (token: string, customApiKey?: string): Promise<User> => {
  let copilotClient: CopilotAPI
  try {
    copilotClient = new CopilotAPI(token, customApiKey)
  } catch (err) {
    throw new APIError(httpStatus.UNAUTHORIZED, 'Failed to authenticate token')
  }

  const payload = TokenSchema.safeParse(await copilotClient.getTokenPayload())

  if (!payload.success) {
    throw new APIError(httpStatus.UNAUTHORIZED, 'Failed to authenticate token')
  }

  return new User(token, payload.data)
}
export const authenticateWithToken = (...args: unknown[]) => withRetry(_authenticateWithToken, args)

/**
 * Token parser and authentication util
 *
 * `authenticate` takes in the current request, parses the "token" searchParam from it,
 * uses `CopilotAPI` to check if the user token is valid
 * and finally returns an instance of `User` that is associated with this request
 */
const authenticate = async (req: NextRequest) => {
  // Fetch token from search param and validate it
  const token = req.nextUrl.searchParams.get('token')
  const tokenParsed = z.string().safeParse(token)
  if (!tokenParsed.success || !tokenParsed.data) {
    throw new APIError(httpStatus.UNAUTHORIZED, 'Please provide a valid token')
  }

  // Parse token payload from valid token
  return await authenticateWithToken(tokenParsed.data)
}

export default authenticate
