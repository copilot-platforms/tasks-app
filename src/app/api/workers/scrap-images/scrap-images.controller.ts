import { NextRequest, NextResponse } from 'next/server'
import { ScrapImageService } from '@/app/api/workers/scrap-images/scrap-images.service'
import { cronSecret } from '@/config'
import APIError from '@/app/api/core/exceptions/api'

export const RemoveScrapImages = async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    throw new APIError(401, 'Unauthorized')
  }
  const scrapImageService = new ScrapImageService()
  await scrapImageService.removeScrapImages()
  return NextResponse.json({ message: 'Successfully ran deletion of unused images' })
}
