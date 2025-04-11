import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { getTaskPath } from '@api/tasks/tasks.controller'

export const GET = withErrorHandler(getTaskPath)
