import { defaultLimit } from '@/constants/public-api'
import z from 'zod'

type PrismaPaginationArgs = {
  take?: number
  skip?: number
  cursor?: { id: string }
}

export function getBasicPaginationAttributes(limit?: number, lastIdCursor?: string): PrismaPaginationArgs {
  return {
    take: limit,
    cursor: lastIdCursor ? { id: lastIdCursor } : undefined,
    skip: lastIdCursor ? 1 : undefined,
  }
}

export function getPaginationLimit(limit?: number | string | null) {
  const safeLimit = z.coerce.number().safeParse(limit)
  return !safeLimit.success || !safeLimit.data ? defaultLimit : safeLimit.data
}
