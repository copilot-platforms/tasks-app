import { withErrorHandler } from '@/app/api/core/utils/withErrorHandler'
import { getTaskTemplatePublic } from '@/app/api/tasks/templates/templates.controller'

export const GET = withErrorHandler(getTaskTemplatePublic)
