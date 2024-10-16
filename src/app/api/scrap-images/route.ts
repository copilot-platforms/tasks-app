import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { PostScrapImage } from '@api/scrap-images/scrap-images.controller'

export const POST = withErrorHandler(PostScrapImage)
