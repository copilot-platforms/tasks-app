import DBClient from '@/lib/db'
import { PrismaClient } from '@prisma/client'
import User from '@api/core/models/User.model'

/**
 * Base Service with access to db and current user
 */
export class BaseService {
  protected db: PrismaClient = DBClient.getInstance()
  public user: User
  public customApiKey?: string

  constructor(user: User, customCopilotApiKey?: string) {
    this.user = user
    this.customApiKey = customCopilotApiKey
  }
}
