import authenticate from '@api/core/utils/authenticate'
import { ValidateCountService } from '@api/notification/validate-count/validateCount.service'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 300

export const validateCount = async (req: NextRequest) => {
  const user = await authenticate(req)
  const validateCountService = new ValidateCountService(user)
  await validateCountService.fixClientNotificationCount()

  return NextResponse.json({ message: 'Validated counts successufully' })
}
