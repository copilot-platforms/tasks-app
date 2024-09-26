import { StatusableError } from '@/types/CopilotApiError'
import pRetry, { FailedAttemptError } from 'p-retry'
import * as Sentry from '@sentry/nextjs'

export const withRetry = async <T>(fn: (...args: any[]) => Promise<T>, args: any[]): Promise<T> => {
  return await pRetry(
    async () => {
      try {
        return await fn(...args)
      } catch (error) {
        // Hopefully now sentry doesn't report retry errors as well. We have enough triage issues as it is
        Sentry.withScope((scope) => {
          scope.addEventProcessor((event) => {
            if (event.level === 'error' && event.message && event.message.includes('An error occurred during retry')) {
              return null // Discard the event as it occured during retry
            }
            return event
          })
          // Log the error without triggering Sentry
          console.error('An error occurred during retry, but it will be retried:', error)
        })
        // Rethrow the error so pRetry can rety
        throw error
      }
    },

    {
      retries: 3,
      minTimeout: 500,
      maxTimeout: 500,
      factor: 2, // Exponential factor for timeout delay. Tweak this if issues still persist
      onFailedAttempt: (error: FailedAttemptError) => {
        console.warn(
          `CopilotAPI#withRetry | Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left. Error:`,
          error,
        )
      },
      shouldRetry: (error: any) => {
        // Typecasting because Copilot doesn't export an error class
        const err = error as StatusableError
        // Retry only if statusCode === 429
        return err.status === 429
      },
    },
  )
}
