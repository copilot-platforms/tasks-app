import { withErrorHandler } from '@/app/api/core/utils/withErrorHandler'
import { createComment } from '@/app/api/comment/comment.controller'

export const maxDuration = 300

export const POST = withErrorHandler(createComment)
