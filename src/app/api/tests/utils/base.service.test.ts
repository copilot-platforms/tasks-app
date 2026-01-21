import { BaseService } from '@api/core/services/base.service'
import { CopilotAPI } from '@/utils/CopilotAPI'

jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({}),
  },
}))

jest.mock('@/utils/CopilotAPI', () => ({
  __esModule: true,
  CopilotAPI: jest.fn().mockImplementation((token: string, customApiKey?: string) => ({
    __token: token,
    __customApiKey: customApiKey,
  })),
}))

describe('BaseService', () => {
  beforeEach(() => {
    ;(CopilotAPI as unknown as jest.Mock).mockClear()
    delete globalThis.copilot
    delete globalThis.token
    delete globalThis.copilotApiKey
  })

  it('recreates the Copilot client when the token changes (and updates global token)', () => {
    const userA = { token: 'token-a' } as any
    const userB = { token: 'token-b' } as any

    new BaseService(userA)
    expect(CopilotAPI).toHaveBeenCalledWith('token-a', undefined)
    expect(globalThis.token).toBe('token-a')

    new BaseService(userB)
    expect(CopilotAPI).toHaveBeenLastCalledWith('token-b', undefined)
    expect(globalThis.token).toBe('token-b')

    // Regression: previously this would NOT recreate because global token was never updated,
    // so we'd reuse a client configured for a different token/portal.
    new BaseService(userA)
    expect(CopilotAPI).toHaveBeenLastCalledWith('token-a', undefined)
    expect(globalThis.token).toBe('token-a')
  })

  it('recreates the Copilot client when customApiKey changes for the same token', () => {
    const userA = { token: 'token-a' } as any

    new BaseService(userA, 'key-1')
    const firstClient = globalThis.copilot

    new BaseService(userA, 'key-2')
    expect(CopilotAPI).toHaveBeenLastCalledWith('token-a', 'key-2')
    expect(globalThis.copilot).not.toBe(firstClient)
    expect(globalThis.copilotApiKey).toBe('key-2')
  })
})

