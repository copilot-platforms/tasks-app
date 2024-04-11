import { pipe, pipeWithErrorInterceptor } from '@/lib/plumber'
import { index } from './tasks.handler'
import { authenticateToken } from '../_middlewares/auth'
import { errorHandler } from '../_middlewares/errorHandler'

// @ts-expect-error Need to type safe plumber
export const GET = pipeWithErrorInterceptor(authenticateToken, index, errorHandler)
