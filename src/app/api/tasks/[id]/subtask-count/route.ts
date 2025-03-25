import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { getSubtaskCount } from '@api/tasks/subtasks.controller'

export const GET = withErrorHandler(getSubtaskCount)
