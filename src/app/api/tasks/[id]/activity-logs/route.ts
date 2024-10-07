import { getActivityLogsForTask } from '@/app/api/activity-logs/activityLogs.controller'
import { withErrorHandler } from '@api/core/utils/withErrorHandler'

export const GET = withErrorHandler(getActivityLogsForTask)
