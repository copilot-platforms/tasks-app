import { CopilotAPI } from '@/utils/CopilotAPI'
import { NextRequest } from 'next/server'
import User from '../models/User.model'
import { z } from 'zod'
import { TokenSchema } from '@/types/common'

/**
 * Token parser and authentication service for API
 */
class AuthService {
  static async authenticate(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token')
    const tokenParsed = z.string().safeParse(token)
    if (!tokenParsed.success) {
      throw new APIError(401, 'Please provide a valid token')
    }

    const copilotClient = new CopilotAPI(tokenParsed.data)
    const payload = TokenSchema.safeParse(await copilotClient.getTokenPayload())

    if (!payload.success) {
      throw new APIError(401, 'Failed to authenticate token')
    }

    return new User(tokenParsed.data, payload.data)
  }
}

export default AuthService
