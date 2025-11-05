import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { withExecTimeCap } from '@api/core/utils/withExecTimeCap'
import { createTaskPublic, getAllTasksPublic } from '@api/tasks/public/public.controller'

export const GET = withErrorHandler(getAllTasksPublic)
export const POST = withExecTimeCap(withErrorHandler(createTaskPublic), 10_000)
