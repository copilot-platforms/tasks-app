import { SuperRequestService } from '@api/tests/__utils__/SuperRequestService'
import httpStatus from 'http-status'

describe('/api/health-check', () => {
  let req: SuperRequestService

  beforeAll(() => {
    req = new SuperRequestService()
  })

  it('works!', async () => {
    const response = await req.get('/api/health-check')
    expect(response.status).toBe(httpStatus.OK)
    expect(response.body.message).toBe('Copilot Tasks app API is rolling 🔥')
  })
})
