import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { getUsersForClients } from '@api/users/users.controller'

export const GET = withErrorHandler(getUsersForClients)
