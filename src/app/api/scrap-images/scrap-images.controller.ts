import { ScrapImageRequestSchema } from '@/types/common'
import authenticate from '@api/core/utils/authenticate'
import { NextRequest, NextResponse } from 'next/server'
import { ScrapImageService } from '@api/scrap-images/scrap-images.service'

export const PostScrapImage = async (req: NextRequest) => {
  const user = await authenticate(req)
  const scrapImageService = new ScrapImageService(user)

  const data = ScrapImageRequestSchema.parse(await req.json())

  await scrapImageService.createScrapImage(data)
  return NextResponse.json({})
}
