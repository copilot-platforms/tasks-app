import { withErrorHandler } from '@/app/api/core/utils/withErrorHandler'
import { getTaskTemplatePublic } from '@/app/api/tasks/templates/public/public.controller'

export const GET = withErrorHandler(getTaskTemplatePublic)
