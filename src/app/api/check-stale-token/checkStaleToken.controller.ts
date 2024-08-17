import { NextRequest, NextResponse } from 'next/server'
import authenticate from '../core/utils/authenticate'
import { z } from 'zod'
import APIError from '../core/exceptions/api'
import httpStatus from 'http-status'
import { CopilotAPI } from '@/utils/CopilotAPI'

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
  const isValid = client.companyId !== user.companyId
  return NextResponse.json(isValid)
}
