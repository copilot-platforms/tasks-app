import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { deleteAttachment, getAttachments } from '@api/attachments/attachments.controller'

export const GET = withErrorHandler(getAttachments)
export const DELETE = withErrorHandler(deleteAttachment)
