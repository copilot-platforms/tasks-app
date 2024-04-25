import { NextRequest, NextResponse } from 'next/server'
import authenticate from '@api/core/utils/authenticate'
import { ViewSettingsService } from './viewSettings.service'

export const getViewSetting = async (req: NextRequest) => {
  const user = await authenticate(req)

  const viewSettingsService = new ViewSettingsService(user)
  const viewSetting = await viewSettingsService.getViewSettingsForUser()

  return NextResponse.json({ viewSetting })
}
