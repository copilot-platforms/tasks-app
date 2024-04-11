import { NextRequest } from 'next/server'
import { Token } from './common'

export type APIRoutes = 'tasks'

export type RouteActions = 'index' | 'show' | 'create' | 'update' | 'destroy'

export type AuthenticatedNextRequest = NextRequest & {
  token: string
  workspaceId: string
  clientId?: string
  companyId?: string
  internalUserId?: string
}

export type UserRole = 'client' | 'iu'

export type AuthenticatedPipeParams = {
  tokenPayload: Token
  role: UserRole
  route?: string
}

export type AuthenticatedParams = {
  pipeParams: AuthenticatedPipeParams
}
