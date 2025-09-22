import { StatusableError } from '@/types/CopilotApiError'
import pRetry, { FailedAttemptError } from 'p-retry'
import * as Sentry from '@sentry/nextjs'

export const withRetry = async <T>(fn: (...args: any[]) => Promise<T>, args: any[]): Promise<T> => {
  let isEventProcessorRegistered = false

  return await pRetry(
    async () => {
      try {
        return await fn(...args)
      } catch (error) {
        // Hopefully now sentry doesn't report retry errors as well. We have enough triage issues as it is
        Sentry.withScope((scope) => {
          if (isEventProcessorRegistered) return

          isEventProcessorRegistered = true
          scope.addEventProcessor((event) => {
            if (event.level === 'error' && event.message && event.message.includes('An error occurred during retry')) {
              return null // Discard the event as it occured during retry
            }
            return event
          })
        })
        // Rethrow the error so pRetry can rety
        throw error
      }
    },

    {
      retries: 3,
      minTimeout: 1000,
      maxTimeout: 3000,
      factor: 2, // Exponential factor for timeout delay. Tweak this if issues still persist
      onFailedAttempt: (error: FailedAttemptError) => {
        console.warn(
          `CopilotAPI#withRetry | Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left`,
        )
      },
      shouldRetry: (error: any) => {
        // Typecasting because Copilot doesn't export an error class
        const err = error as StatusableError
        // Retry if statusCode is 429 (ratelimit), 408 (timeouts), or any server related (5xx) error
        return [408, 429].includes(err.status) || (err.status >= 500 && err.status <= 511)
      },
    },
  )
}
