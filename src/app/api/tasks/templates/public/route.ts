import { withErrorHandler } from '@/app/api/core/utils/withErrorHandler'
import { getTaskTemplatesPublic } from '@/app/api/tasks/templates/templates.controller'

export const GET = withErrorHandler(getTaskTemplatesPublic)
