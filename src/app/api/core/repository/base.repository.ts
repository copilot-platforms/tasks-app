import DBClient from '@/lib/db'
import User from '@api/core/models/User.model'
import { PrismaClient } from '@prisma/client'

/**
 * Base Repository with access to db and current user
 * Only use an additional repository layer when queries related to a service are complex.
 * Otherwise DB-access layer can be pushed to service layer itself
 */
export class BaseRepository {
  protected db: PrismaClient = DBClient.getInstance()
  public user: User

  constructor(user: User) {
    this.user = user
  }
}
