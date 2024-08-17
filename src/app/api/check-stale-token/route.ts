import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { checkStaleToken } from '@api/check-stale-token/checkStaleToken.controller'

// This route validates if data encoded in token payload is in sync with latest client data in Copilot API
export const GET = withErrorHandler(checkStaleToken)
