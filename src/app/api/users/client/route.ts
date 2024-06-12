import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { getClients } from '@api/users/users.controller'

export const GET = withErrorHandler(getClients)
