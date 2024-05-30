import { withErrorHandler } from '../../core/utils/withErrorHandler'
import { createActivityLog } from '../activity.controller'

export const POST = withErrorHandler(createActivityLog)
