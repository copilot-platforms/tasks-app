import { NextRequest } from 'next/server'
import { MiddlewareChain, NextFn, Params } from './types'

export const startPipe = async (req: NextRequest, params: Params, fns: MiddlewareChain, currentFnIndex: number) => {
  const next: NextFn = async (pipeParams: any) => {
    // Recursively run next pipe fn until the end of the chain
    const nextPipeFunction = fns[currentFnIndex + 1]
    if (!nextPipeFunction) return

    return await startPipe(req, { ...params, pipeParams }, fns, currentFnIndex + 1)
  }

  // The next function will recursively run next function from list of pipe functions
  return await fns[currentFnIndex](req, params, next)
}
