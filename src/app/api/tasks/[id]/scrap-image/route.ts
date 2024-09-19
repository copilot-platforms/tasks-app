import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { PostScrapImage } from '@/app/api/tasks/tasks.controller'

export const POST = withErrorHandler(PostScrapImage)
