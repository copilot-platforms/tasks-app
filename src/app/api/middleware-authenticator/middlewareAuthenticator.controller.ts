import { copilotAPIKey } from '@/config'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { NextRequest, NextResponse } from 'next/server'
import APIError from '@/app/api/core/exceptions/api'
import httpStatus from 'http-status'
import { z } from 'zod'
import { TokenSchema } from '@/types/common'
import User from '../core/models/User.model'

export const authenticateMiddlewareRequest = async (req: NextRequest): Promise<NextResponse<User>> => {
  const token = req.nextUrl.searchParams.get('token')
  const apiKey = req.nextUrl.searchParams.get('apiKey')

  if (!apiKey || apiKey !== copilotAPIKey) {
    throw new APIError(httpStatus.UNAUTHORIZED, "You're not authorized to access this route!")
  }

  const tokenParsed = z.string().safeParse(token)
  if (!tokenParsed.success || !tokenParsed.data) {
    throw new APIError(httpStatus.UNAUTHORIZED, 'Please provide a valid token')
  }

  // Parse token payload from valid token
  const copilotClient = new CopilotAPI(tokenParsed.data)
  const payload = TokenSchema.safeParse(await copilotClient.getTokenPayload())
  if (!payload.success) {
    throw new APIError(httpStatus.UNAUTHORIZED, 'Failed to authenticate token')
  }

  const user = new User(tokenParsed.data, payload.data)

  return NextResponse.json(user)
}
