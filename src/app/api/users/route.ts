import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { getUsers } from '@api/users/users.controller'

export const GET = withErrorHandler(getUsers)
