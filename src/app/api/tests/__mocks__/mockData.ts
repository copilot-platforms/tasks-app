import { UserRole } from '@/app/api/core/types/user'
import { Token } from '@/types/common'

export const validMockTokens: { [_k in UserRole]: string } = {
  internalUser: 'iu-token',
  client: 'client-token',
}

const mockInternalUserTokenPayload: Token = {
  internalUserId: 'internalUserId',
  workspaceId: 'workspaceId',
}

const mockClientTokenPayload: Token = {
  clientId: 'clientId',
  companyId: 'companyId',
  workspaceId: 'workspaceId',
}

export const mockTokenPayloads = {
  internalUser: mockInternalUserTokenPayload,
  client: mockClientTokenPayload,
}
