import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { createStatus, getStatuses } from '@api/status/status.controller'

export const GET = withErrorHandler(getStatuses)
export const POST = withErrorHandler(createStatus)
