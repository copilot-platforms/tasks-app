import DBClient from '@/lib/db'
import { PrismaClient } from '@prisma/client'
import User from '@api/core/models/User.model'

/**
 * Base Service with access to db and current user
 */
export class BaseService {
  protected db: PrismaClient = DBClient.getInstance()
  public user: User

  constructor(user: User) {
    this.user = user
  }
}
