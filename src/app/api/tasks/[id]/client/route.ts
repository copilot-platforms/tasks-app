import { withErrorHandler } from '@/app/api/core/utils/withErrorHandler'
import { clientUpdateTask } from '@/app/api/tasks/tasks.controller'

export const maxDuration = 300

export const PATCH = withErrorHandler(clientUpdateTask)
