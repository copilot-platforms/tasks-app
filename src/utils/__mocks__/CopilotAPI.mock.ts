import { CopilotApiError } from '@/types/CopilotApiError'
import { jest } from '@jest/globals'
import { UserRole } from '@/app/api/core/types/user'
import { mockTokenPayloads, validMockTokens } from '@/utils/__mocks__/mockData'
import httpStatus from 'http-status'

// Mock implementation with explicit types
export const mockCopilotAPI = (token: string) => {
  if (!Object.values(validMockTokens).includes(token)) {
    throw new CopilotApiError(httpStatus.UNAUTHORIZED, { message: 'Failed to authenticate token' })
  }

  const userRole = Object.keys(validMockTokens).find((key) => validMockTokens[key as UserRole] === token)

  const getTokenPayload = jest.fn().mockResolvedValue(mockTokenPayloads[userRole as UserRole] as never)

  return {
    getTokenPayload,
    getWorkspace: jest.fn(),
    getClient: jest.fn(),
    getClients: jest.fn(),
    updateClient: jest.fn(),
    getCompany: jest.fn(),
    getCompanies: jest.fn(),
    getCustomFields: jest.fn(),
    getInternalUsers: jest.fn(),
  }
}

export const CopilotAPI = jest.fn().mockImplementation(() => mockCopilotAPI)
