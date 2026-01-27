import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { deleteComment, updateComment } from '@/app/api/comments/comment.controller'

export const PATCH = withErrorHandler(updateComment)
export const DELETE = withErrorHandler(deleteComment)
