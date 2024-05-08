import { SuperRequestService } from '@api/tests/__utils__/SuperRequestService'
import httpStatus from 'http-status'

describe('/api/users', () => {
  let req: SuperRequestService

  beforeAll(() => {
    req = new SuperRequestService()
  })

  describe('auth', () => {
    it('allows authenticated internal users', async () => {
      // jest.spyOn(CopilotAPI, 'getTokenPayload').mockReturnValue(mockTokenPayloads.internalUser)
      // jest.mock('@/utils/CopilotAPI', () => ({
      //   CopilotAPI: jest.fn().mockImplementation((token: string) => mockCopilotAPI(token)),
      // }))

      const response = await req.get('/api/users?token=iu-token')
      expect(response.status).toBe(httpStatus.OK)
    })
  })
})
