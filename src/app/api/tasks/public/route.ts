import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { createTaskPublic, getAllTasksPublic } from '@api/tasks/public/public.controller'

export const GET = withErrorHandler(getAllTasksPublic)
export const POST = withErrorHandler(createTaskPublic)
