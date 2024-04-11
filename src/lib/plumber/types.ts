import { AuthenticatedParams } from '@/app/api/core/types/context'
import { NextRequest, NextResponse } from 'next/server'

export type NextFn = (pipeParams?: any) => Promise<NextResponse | void>

export interface Params {
  params?: Record<string, string>
  context?: Record<string, unknown>
}

type MiddlewareOrHandler = (
  req: NextRequest,
  params?: Params,
  next?: NextFn,
) => void | NextResponse<unknown> | Promise<NextResponse<unknown> | void>

export type MiddlewareChain = MiddlewareOrHandler[]
