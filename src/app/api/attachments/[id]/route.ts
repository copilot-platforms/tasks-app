import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { deleteAttachment } from '@api/attachments/attachments.controller'

export const DELETE = withErrorHandler(deleteAttachment)
