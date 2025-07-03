import { UserRole } from '@api/core/types/user'
import type { Token } from '@/types/common'

/**
 * Domain model representing a Copilot User (InternalUser or Client).
 * Designed to be immutable (readonly where possible) for safe API use.
 */
export default class User {
  readonly token: string
  readonly role: UserRole
  readonly workspaceId: string
  readonly clientId?: string
  readonly companyId?: string
  readonly internalUserId?: string

  constructor(token: string, tokenPayload: Token) {
    this.token = token
    this.role = tokenPayload.internalUserId ? UserRole.IU : UserRole.Client
    this.internalUserId = tokenPayload.internalUserId
    this.clientId = tokenPayload.clientId
    this.companyId = tokenPayload.companyId
    this.workspaceId = tokenPayload.workspaceId
  }
}
