import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { getAllTasksPublic } from '@api/tasks/public/public.controller'

export const GET = withErrorHandler(getAllTasksPublic)
