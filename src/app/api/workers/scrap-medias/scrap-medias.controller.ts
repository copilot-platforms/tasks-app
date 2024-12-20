import { NextRequest, NextResponse } from 'next/server'
import { ScrapMediaService } from '@/app/api/workers/scrap-medias/scrap-medias.service'
import { cronSecret } from '@/config'
import APIError from '@/app/api/core/exceptions/api'

export const removeScrapMedias = async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    throw new APIError(401, 'Unauthorized')
  }
  const scrapMediaService = new ScrapMediaService()
  await scrapMediaService.removeScrapMedias()
  return NextResponse.json({ message: 'Successfully ran deletion of unused images' })
}
