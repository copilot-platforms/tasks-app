import DBClient from '@/lib/db'
import { CopilotAPI } from '@/utils/CopilotAPI'
import User from '@api/core/models/User.model'
import { PrismaClient } from '@prisma/client'

/**
 * Base Service with access to db and current user
 */
export class BaseService {
  protected db: PrismaClient = DBClient.getInstance()
  public user: User
  public customApiKey?: string
  protected copilot: CopilotAPI

  constructor(user: User, customCopilotApiKey?: string) {
    this.user = user
    this.customApiKey = customCopilotApiKey
    this.copilot = new CopilotAPI(user.token)
  }

  setTransaction(tx: PrismaClient) {
    this.db = tx
  }

  unsetTransaction() {
    this.db = DBClient.getInstance()
  }
}
