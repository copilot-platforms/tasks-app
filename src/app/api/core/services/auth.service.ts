import { CopilotAPI } from '@/utils/CopilotAPI'
import { NextRequest } from 'next/server'
import User from '@api/core/models/User.model'
import { z } from 'zod'
import { TokenSchema } from '@/types/common'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'

/**
 * Token parser and authentication service
 */
class AuthService {
  static async authenticate(req: NextRequest) {
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
}

export default AuthService
