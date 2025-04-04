import { withErrorHandler } from '@/app/api/core/utils/withErrorHandler'
import { getAccesibleTasksIds } from '@/app/api/tasks/tasks.controller'

export const GET = withErrorHandler(getAccesibleTasksIds) // returns list of ids of tasks that are accessible to the user.
