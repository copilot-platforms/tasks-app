import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { createSubTaskTemplate, deleteTaskTemplate, updateTaskTemplate } from '@api/tasks/templates/templates.controller'

export const PATCH = withErrorHandler(updateTaskTemplate)
export const DELETE = withErrorHandler(deleteTaskTemplate)
export const POST = withErrorHandler(createSubTaskTemplate)
