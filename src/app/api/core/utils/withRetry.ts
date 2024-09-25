import pRetry, { FailedAttemptError } from 'p-retry'

export const withRetry = <T>(fn: (...args: any[]) => Promise<T>, args: any[]): Promise<T> => {
  return pRetry(() => fn(...args), {
    retries: 3,
    minTimeout: 500,
    maxTimeout: 500,
    factor: 1, // No exponential delays for now

    onFailedAttempt: (error: FailedAttemptError) => {
      console.error(
        `CopilotAPI#withRetry - Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left. Error:`,
        error,
      )
    },

    shouldRetry: (error: any) => {
      // Typecasting because Copilot doesn't export an error class
      const err = error as { status?: number }
      // Retry only if statusCode === 429
      return err.status === 429
    },
  })
}
