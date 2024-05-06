import { CopilotAPI } from '@/utils/CopilotAPI'
import { mockCopilotAPI } from '@api/tests/__mocks__/CopilotAPI.mock'

jest.mock('@/utils/CopilotAPI', () => ({
  CopilotAPI: jest.fn().mockImplementation((token: string) => mockCopilotAPI(token)),
}))

describe('Mocked CopilotAPI util', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should use mock data for getting IU token payload', async () => {
    const copilot = new CopilotAPI('iu-token')
    const token = await copilot.getTokenPayload()
    expect(token).toEqual({
      internalUserId: 'internalUserId',
      workspaceId: 'workspaceId',
    })
  })

  it('should use mock data for getting client token payload', async () => {
    const copilot = new CopilotAPI('client-token')
    const result = await copilot.getTokenPayload()
    expect(result).toEqual({
      clientId: 'clientId',
      companyId: 'companyId',
      workspaceId: 'workspaceId',
    })
  })

  it('should return null for invalid token', async () => {
    const copilot = new CopilotAPI('this-token-is-totally-wrong')
    const result = await copilot.getTokenPayload()
    expect(result).toBe(null)
  })
})
