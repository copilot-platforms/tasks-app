import { withErrorHandler } from '../../core/utils/withErrorHandler'
import { deleteComment, updateComment } from '../comment.controller'

export const PATCH = withErrorHandler(updateComment)
export const DELETE = withErrorHandler(deleteComment)
