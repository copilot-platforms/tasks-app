import { NextRequest, NextResponse } from 'next/server'
import authenticate from '@api/core/utils/authenticate'
import { z } from 'zod'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { CheckStaleTokenResponse } from '@/types/dto/checkStaleToken.dto'

export const checkStaleToken = async (req: NextRequest) => {
  const user = await authenticate(req)
  const { data: clientId, error: clientIdError } = z.string().safeParse(user.clientId)
  if (clientIdError) {
    throw new APIError(httpStatus.UNAUTHORIZED, 'Failed to verify user as client')
  }

  const copilot = new CopilotAPI(user.token)
  const client = await copilot.getClient(clientId)

  // --- Validation criteria
  // companyId encoded in token payload must match copilot client's companyId
  const isStaleToken = client.companyId !== user.companyId
  const response = CheckStaleTokenResponse.parse(isStaleToken)

  return NextResponse.json(response)
}
