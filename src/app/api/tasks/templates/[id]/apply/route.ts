import { withErrorHandler } from '@/app/api/core/utils/withErrorHandler'
import { applyTemplate } from '@api/tasks/templates/templates.controller'

export const GET = withErrorHandler(applyTemplate)
