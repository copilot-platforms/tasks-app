import { withErrorHandler } from '../core/utils/withErrorHandler'
import { createComment } from './comment.controller'

export const POST = withErrorHandler(createComment)
