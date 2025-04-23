import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { getOneTaskPublic } from '@api/tasks/public/public.controller'

export const GET = withErrorHandler(getOneTaskPublic)
