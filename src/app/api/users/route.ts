import { withErrorHandler } from '../core/utils/withErrorHandler'
import { getUsers } from './users.controller'

export const GET = withErrorHandler(getUsers)
