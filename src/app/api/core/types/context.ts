import { Params } from '@/lib/plumber/types'
import User from '../models/User.model'

export interface AuthenticatedParams extends Params {
  user: User
}
