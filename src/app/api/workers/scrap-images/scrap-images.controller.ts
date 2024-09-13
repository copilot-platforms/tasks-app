import { NextRequest, NextResponse } from 'next/server'
import { ScrapImageService } from '@/app/api/workers/scrap-images/scrap-images.service'
import { cronSecret } from '@/config'

export const RemoveScrapImages = async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }
  const scrapImageService = new ScrapImageService()
  await scrapImageService.removeScrapImages()
  return NextResponse.json({ message: 'Successfully ran deletion of unused images' })
}
