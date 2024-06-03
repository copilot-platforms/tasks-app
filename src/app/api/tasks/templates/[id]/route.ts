import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { deleteTaskTemplate, getTaskTemplate, updateTaskTemplate } from '@api/tasks/templates/templates.controller'

export const GET = withErrorHandler(getTaskTemplate)
export const PATCH = withErrorHandler(updateTaskTemplate)
export const DELETE = withErrorHandler(deleteTaskTemplate)
