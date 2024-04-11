import { NextRequest } from 'next/server'
import { MiddlewareChain, Params } from '@plumber/types'
import { startPipe } from '@plumber/helpers'

const pipe = (...fns: MiddlewareChain) => {
  return async (req: NextRequest, params: Params) => {
    return await startPipe(req, params, fns, 0)
  }
}

const pipeWithErrorInterceptor = (...fns: MiddlewareChain) => {
  const errorInterceptor = fns[fns.length - 1]
  try {
    return pipe(...fns.slice(0, fns.length - 1))
  } catch (e) {
    errorInterceptor(e)
  }
}

export { pipe, pipeWithErrorInterceptor }
