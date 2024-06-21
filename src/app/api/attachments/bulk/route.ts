import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { createMultipleAttachments } from '@api/attachments/attachments.controller'

export const POST = withErrorHandler(createMultipleAttachments)
