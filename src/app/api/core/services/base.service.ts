import DBClient from '@/lib/db'

import type User from '@api/core/models/User.model'
import { PrismaClient } from '@prisma/client'

/**
 * Base class for services, giving access to the current user and database.
 * Designed for subclassing to enforce best practices around dependency injection.
 */
export abstract class BaseService {
  /** Shared prisma client for DB access (per request) */
  protected db: PrismaClient

  /** The authenticated user for this request context */
  protected readonly user: User

  /** Optional custom API key if needed (eg. Copilot, integrations) */
  protected readonly customApiKey?: string

  constructor(opts: { user: User; customApiKey?: string }) {
    this.user = opts.user
    this.customApiKey = opts.customApiKey
    this.db = DBClient.getInstance()
  }

  /**
   * Use a transactional prisma client for the remainder of this request.
   * @param tx Transactional PrismaClient instance.
   */
  setTransaction(tx: PrismaClient): void {
    this.db = tx
  }

  /**
   * Revert to main singleton DBClient after transaction ends.
   */
  unsetTransaction(): void {
    this.db = DBClient.getInstance()
  }
}
