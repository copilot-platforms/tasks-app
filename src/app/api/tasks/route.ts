import { pipe } from '@/lib/plumber'
import { authenticateUser } from '../core/middlewares/auth'
import { getTasks } from './tasks.handler'

export const GET = pipe(authenticateUser, getTasks)
