import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { createAttachment, getAttachments } from '@api/attachments/attachments.controller'

export const POST = withErrorHandler(createAttachment)
export const GET = withErrorHandler(getAttachments)
