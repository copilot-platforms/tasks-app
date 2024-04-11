import { NextRequest, NextResponse } from 'next/server'

export type NextFn = (pipeParams?: any) => Promise<NextResponse | void>

export type Params = {
  params?: Record<string, string>
  pipeParams?: any
}

type MiddlewareOrHandler<AdditionalReqProperties = void> = (
  req: NextRequest & AdditionalReqProperties,
  params?: Params,
  next?: NextFn,
) => void | NextResponse | Promise<NextResponse | void>

export type MiddlewareChain = MiddlewareOrHandler<any>[]
