import { withErrorHandler } from '../core/utils/withErrorHandler'
import { authenticateMiddlewareRequest } from './middlewareAuthenticator.controller'

export const POST = withErrorHandler(authenticateMiddlewareRequest)
