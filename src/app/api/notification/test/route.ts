import { NextRequest, NextResponse } from 'next/server'
import authenticate from '../../core/utils/authenticate'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { unstable_noStore } from 'next/cache'

export const GET = async (req: NextRequest) => {
  unstable_noStore()
  const user = await authenticate(req)
  const copilot = new CopilotAPI(user.token)
  await copilot.markNotificationAsRead('e9f827d0-6ebe-4476-8e26-de263ba1eaa9')
  return NextResponse.json(true)
}
