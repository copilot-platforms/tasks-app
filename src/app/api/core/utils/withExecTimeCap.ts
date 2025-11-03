import { RequestHandler } from '@api/core/utils/withErrorHandler'
import * as Sentry from '@sentry/nextjs'
import { NextRequest } from 'next/server'

/**
 * Util to report to Sentry if execution time of a function exceeds a given cap.
 * @param handler - Handler function to wrap
 * @param capInMs - Maximum execution time cap to tolerate.
 *   Will report to Sentry if time exceeds value, no cap
 */
export const withExecTimeCap = (handler: RequestHandler, capInMs: number) => {
  return async (req: NextRequest, params: any) => {
    const start = Date.now()

    const response = await handler(req, params)

    const durationMs = Date.now() - start
    if (durationMs > capInMs) {
      console.info('Reporting slow execution to Sentry, duration:', durationMs, 'ms')
      Sentry.withScope((scope) => {
        scope.setLevel('warning')
        scope.setTag('isCustomWarning', 'true')
        scope.setContext('performance', {
          duration_ms: durationMs,
          threshold_ms: capInMs,
        })
        Sentry.captureMessage('Slow performance: execution time exceeded timeframe')
      })
    }

    return response
  }
}
