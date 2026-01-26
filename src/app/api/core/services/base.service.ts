import DBClient from '@/lib/db'
import { CopilotAPI } from '@/utils/CopilotAPI'
import User from '@api/core/models/User.model'
import { PrismaClient } from '@prisma/client'

declare global {
  var copilot: CopilotAPI | undefined
  var token: string | undefined
  var copilotApiKey: string | undefined
}

/**
 * Base Service with access to db and current user
 */
export class BaseService {
  protected db: PrismaClient = DBClient.getInstance()
  public readonly user: User
  public readonly customApiKey?: string
  protected readonly copilot: CopilotAPI

  constructor(user: User, customCopilotApiKey?: string) {
    this.user = user
    this.customApiKey = customCopilotApiKey

    // If token or copiltoApiKey mismatches, or global copilot instance is not present, create a new one.
    // INFO: The token mismatch check is to make sure that fluid compute sharing serverless functions doesn't reuse the same SDK instance
    if (globalThis.token !== user.token || globalThis.copilotApiKey !== customCopilotApiKey || !globalThis.copilot) {
      globalThis.token = user.token
      globalThis.copilotApiKey = customCopilotApiKey
      globalThis.copilot = new CopilotAPI(user.token, customCopilotApiKey)
    }

    this.copilot = globalThis.copilot
  }

  setTransaction(tx: PrismaClient) {
    this.db = tx
  }

  unsetTransaction() {
    this.db = DBClient.getInstance()
  }
}
