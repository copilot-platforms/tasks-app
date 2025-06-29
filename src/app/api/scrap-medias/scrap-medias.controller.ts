import { ScrapMediaRequestSchema } from '@/types/common'
import authenticate from '@api/core/utils/authenticate'
import { NextRequest, NextResponse } from 'next/server'
import { ScrapMediaService } from '@/app/api/scrap-medias/scrap-medias.service'

export const PostScrapMedia = async (req: NextRequest) => {
  const user = await authenticate(req)
  const scrapMediaService = new ScrapMediaService({ user })

  const data = ScrapMediaRequestSchema.parse(await req.json())

  await scrapMediaService.createScrapImage(data)
  return NextResponse.json({})
}
