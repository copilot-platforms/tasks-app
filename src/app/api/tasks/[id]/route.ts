import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { deleteTask, getTask, updateTask } from '@api/tasks/tasks.controller'

export const GET = withErrorHandler(getTask)
export const PATCH = withErrorHandler(updateTask)
export const DELETE = withErrorHandler(deleteTask)
