import { withErrorHandler } from '@/app/api/core/utils/withErrorHandler'
import { createComment } from '@/app/api/comment/comment.controller'

export const POST = withErrorHandler(createComment)
