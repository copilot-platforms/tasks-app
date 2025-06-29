import { CopilotAPI } from '@/utils/CopilotAPI'
import { NextRequest } from 'next/server'
import User from '@api/core/models/User.model'
import { z } from 'zod'
import { TokenSchema } from '@/types/common'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'
import { withRetry } from './withRetry'

/**
 * Authenticates a raw token, optionally using a custom API key. Throws detailed APIError on failure.
 * @param token The user's JWT token to validate
 * @param customApiKey Custom API key to inject if needed
 * @returns Typed User on success
 */
export const _authenticateWithToken = async (token: string, customApiKey?: string): Promise<User> => {
  let copilotClient: CopilotAPI
  try {
    copilotClient = new CopilotAPI(token, customApiKey)
  } catch {
    throw new APIError(httpStatus.UNAUTHORIZED, 'Failed to authenticate token')
  }

  const payload = TokenSchema.safeParse(await copilotClient.getTokenPayload())
  if (!payload.success) {
    throw new APIError(httpStatus.UNAUTHORIZED, 'Failed to authenticate token')
  }
  return new User(token, payload.data)
}

/**
 * Wrapper around _authenticateWithToken that retries on certain errors.
 */
export const authenticateWithToken = (...args: unknown[]) => withRetry(_authenticateWithToken, args)

/**
 * Main request authentication util. Parses the "token" searchParam from the request and fully authenticates it using CopilotAPI.
 * Returns a typed User model on success; throws APIError on failure at any stage. Handles token parse and shape errors gracefully.
 */
export const authenticate = async (req: NextRequest): Promise<User> => {
  const token = req.nextUrl.searchParams.get('token')
  const tokenParsed = z.string().safeParse(token)
  if (!tokenParsed.success || !tokenParsed.data) {
    throw new APIError(httpStatus.UNAUTHORIZED, 'Please provide a valid token')
  }
  return await authenticateWithToken(tokenParsed.data)
}

export default authenticate
