import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { get } from '@api/tasks/[id]/activity-logs/activity.controller'

export const GET = withErrorHandler(get)
