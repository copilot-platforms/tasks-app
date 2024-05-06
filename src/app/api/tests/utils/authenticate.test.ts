import authenticate from '@api/core/utils/authenticate'
import { buildNextRequest } from '@api/core/utils/testUtils'
import httpStatus from 'http-status'
import { CopilotApiError } from '@/types/CopilotApiError'
import { mockTokenPayloads } from '@/app/api/tests/__mocks__/mockData'
import { mockCopilotAPI } from '@api/tests/__mocks__/CopilotAPI.mock'
import APIError from '../../core/exceptions/api'

jest.mock('@/utils/CopilotAPI', () => ({
  CopilotAPI: jest.fn().mockImplementation((token: string) => mockCopilotAPI(token)),
}))

describe('authenticate util', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('authenticates a valid IU token', async () => {
    const req = buildNextRequest(`/?token=iu-token`)
    const user = await authenticate(req)
    expect(user.internalUserId).toBe(mockTokenPayloads.internalUser.internalUserId)
  })

  it('authenticates a valid client token', async () => {
    const req = buildNextRequest(`/?token=client-token`)
    const user = await authenticate(req)
    expect(user.clientId).toBe(mockTokenPayloads.client.clientId)
  })

  it('throws APIError if token is not provided', async () => {
    const req = buildNextRequest(`/?token=`)
    try {
      await authenticate(req)
      fail('Expected authenticate function to throw an error, but it did not')
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(APIError)
      expect((error as APIError).status).toBe(httpStatus.UNAUTHORIZED)
      expect((error as Error).message).toBe('Please provide a valid token')
    }
  })

  it('throws CopilotApiError if token cannot be authenticated', async () => {
    const req = buildNextRequest(`/?token=invalid-token`)
    try {
      await authenticate(req)
      fail('Expected authenticate function to throw an error, but it did not')
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(APIError)
      expect((error as Error).message).toBe('Failed to authenticate token')
    }
  })
})
