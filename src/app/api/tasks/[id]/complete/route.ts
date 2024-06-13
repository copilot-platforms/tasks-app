import { withErrorHandler } from '@/app/api/core/utils/withErrorHandler'
import { completeTask } from '@/app/api/tasks/tasks.controller'

export const PATCH = withErrorHandler(completeTask)
