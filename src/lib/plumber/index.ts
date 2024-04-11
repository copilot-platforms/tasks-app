import { NextRequest } from 'next/server'
import { MiddlewareChain, Params } from '@plumber/types'
import { startPipe } from '@plumber/helpers'

const pipe = (...fns: MiddlewareChain) => {
  return async (req: NextRequest, params: Params) => {
    return await startPipe(req, params, fns, 0)
  }
}

export { pipe }
