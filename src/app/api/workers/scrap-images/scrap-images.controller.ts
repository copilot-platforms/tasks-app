import { NextResponse } from 'next/server'
import { authenticateWithToken } from '@/app/api/core/utils/authenticate'
import { ScrapImageService } from '@/app/api/workers/scrap-images/scrap-images.service'
import { cronWorkerToken } from '@/config'
import { z } from 'zod'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'

export const RemoveScrapImages = async () => {
  const token = cronWorkerToken
  const tokenParsed = z.string().safeParse(token)

  if (!tokenParsed.success || !tokenParsed.data) {
    throw new APIError(httpStatus.UNAUTHORIZED, 'Please provide a valid token')
  }
  const user = await authenticateWithToken(tokenParsed.data)

  const scrapImageService = new ScrapImageService(user)
  await scrapImageService.removeScrapImages()
  return NextResponse.json({ message: 'Successfully ran deletion of unused images' })
}
