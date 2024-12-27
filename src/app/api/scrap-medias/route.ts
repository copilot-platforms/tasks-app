import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { PostScrapMedia } from '@/app/api/scrap-medias/scrap-medias.controller'

export const POST = withErrorHandler(PostScrapMedia)
