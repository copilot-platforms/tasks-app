import { UserAction, UserRole } from '@api/core/types/user'
import { Token } from '@/types/common'
import { PoliciesService } from '@api/core/services/policies.service'
import { Routes } from '@api/core/types/api'
import { NextRequest } from 'next/server'

class User implements Token {
  token: string
  role: UserRole
  workspaceId: string
  clientId?: string
  companyId?: string
  internalUserId?: string
  can: (action: UserAction, route: Routes) => boolean

  constructor(token: string, tokenPayload: Token) {
    this.token = token
    this.role = tokenPayload.clientId ? UserRole.Client : UserRole.IU
    this.internalUserId = tokenPayload.internalUserId
    this.clientId = tokenPayload.clientId
    this.companyId = tokenPayload.companyId
    this.workspaceId = tokenPayload.workspaceId

    const policiesService = new PoliciesService(this)
    this.can = policiesService.can.bind(policiesService)
  }
}

export default User
