import { withErrorHandler } from '@/app/api/core/utils/withErrorHandler'
import { getSubtemplates } from '@/app/api/tasks/templates/templates.controller'

export const GET = withErrorHandler(getSubtemplates)
