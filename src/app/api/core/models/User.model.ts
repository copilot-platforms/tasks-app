import { UserAction, UserRole } from '@api/core/types/user'
import { Token } from '@/types/common'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'

class User implements Token {
  token: string
  role: UserRole
  workspaceId: string
  clientId?: string
  companyId?: string
  internalUserId?: string

  constructor(token: string, tokenPayload: Token) {
    this.token = token
    this.role = tokenPayload.clientId ? UserRole.Client : UserRole.IU
    this.internalUserId = tokenPayload.internalUserId
    this.clientId = tokenPayload.clientId
    this.companyId = tokenPayload.companyId
    this.workspaceId = tokenPayload.workspaceId
  }
}

export default User
