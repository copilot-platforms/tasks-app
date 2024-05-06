import { CopilotApiError } from '@/types/CopilotApiError'
import { jest } from '@jest/globals'
import { UserRole } from '@/app/api/core/types/user'
import httpStatus from 'http-status'
import { mockTokenPayloads, validMockTokens } from '@api/tests/__mocks__/mockData'

// Mock implementation with explicit types
export const mockCopilotAPI = (token: string) => {
  const userRole = Object.keys(validMockTokens).find((key) => validMockTokens[key as UserRole] === token)

  const getTokenPayload = jest.fn().mockResolvedValue((mockTokenPayloads[userRole as UserRole] ?? null) as never)

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
