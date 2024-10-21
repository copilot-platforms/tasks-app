import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { getSignedUrlFile } from '@api/attachments/attachments.controller'

export const GET = withErrorHandler(getSignedUrlFile)
