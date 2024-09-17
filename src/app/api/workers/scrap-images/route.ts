import { withErrorHandler } from '@/app/api/core/utils/withErrorHandler'
import { RemoveScrapImages } from '@/app/api/workers/scrap-images/scrap-images.controller'

export const dynamic = 'force-dynamic'

export const maxDuration = 300

export const GET = RemoveScrapImages
