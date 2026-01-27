import { withErrorHandler } from '@/app/api/core/utils/withErrorHandler'
import { createComment, getFilteredComments } from '@/app/api/comments/comment.controller'

export const maxDuration = 300

export const GET = withErrorHandler(getFilteredComments)
export const POST = withErrorHandler(createComment)
