import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { getSignedUrlUpload } from '@api/attachments/attachments.controller'

export const GET = withErrorHandler(getSignedUrlUpload)
