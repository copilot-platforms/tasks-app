import { createTask, getTasks } from '@api/tasks/tasks.controller'
import { withErrorHandler } from '@api/core/utils/withErrorHandler'

export const GET = withErrorHandler(getTasks)
export const POST = withErrorHandler(createTask)
