import { NextRequest, NextResponse } from 'next/server'
import authenticate from '@/app/api/core/utils/authenticate'
import { ScrapImageService } from '@/app/api/workers/scrap-images/scrap-images.service'

export const RemoveScrapImages = async (req: NextRequest) => {
  const user = await authenticate(req)
  const scrapImageService = new ScrapImageService(user)
  await scrapImageService.removeScrapImages()
  return NextResponse.json({ message: 'Successfully ran deletion of unused images' })
}
