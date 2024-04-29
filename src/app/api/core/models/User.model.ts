import { UserRole } from '@api/core/types/user'
import { Token } from '@/types/common'

/**
 * Faux model for Copilot Users (IU + Client)
 * This model is used to repressent the current user based on the token payload decrypted by Copilot SDK
 */
class User {
  readonly role: UserRole
  readonly workspaceId: string
  readonly clientId?: string
  readonly companyId?: string
  readonly internalUserId?: string

  // Instantiate a User from a request token & decrypted payload
  constructor(
    public readonly token: string,
    tokenPayload: Token,
  ) {
    this.role = tokenPayload.clientId ? UserRole.Client : UserRole.IU
    this.internalUserId = tokenPayload.internalUserId
    this.clientId = tokenPayload.clientId
    this.companyId = tokenPayload.companyId
    this.workspaceId = tokenPayload.workspaceId
  }
}

export default User
