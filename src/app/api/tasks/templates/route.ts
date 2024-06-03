import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { createTaskTemplate, getTaskTemplates } from '@api/tasks/templates/templates.controller'

export const GET = withErrorHandler(getTaskTemplates)
export const POST = withErrorHandler(createTaskTemplate)
