import { APIError } from '@/exceptions/api'
import { NextFn } from '@/lib/plumber/types'
import { APIRoutes, AuthenticatedParams, RouteActions } from '@/types/api'
import { NextRequest, NextResponse } from 'next/server'

const POLICIES = {
  iu: {
    tasks: ['all'],
  },
  client: {
    tasks: ['index', 'show'],
  },
}

export const enforcePolicy = (route: APIRoutes, action: RouteActions) => {
  return async (req: NextRequest, { pipeParams }: AuthenticatedParams, next: NextFn) => {
    const policy = POLICIES[pipeParams.role][route]
    if (policy.includes('all') || policy.includes(action)) {
      return await next()
    }

    return new APIError(401, 'You are ')
  }
}
