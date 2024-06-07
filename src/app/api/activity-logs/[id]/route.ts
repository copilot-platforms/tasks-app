import { withErrorHandler } from '../../core/utils/withErrorHandler'
import { getActivityWithComment } from '../activity.controller'

export const GET = withErrorHandler(getActivityWithComment)
