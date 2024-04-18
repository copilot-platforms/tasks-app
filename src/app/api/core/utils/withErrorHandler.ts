import { NextRequest, NextResponse } from 'next/server'
import { ZodError, ZodIssue } from 'zod'
import { CopilotApiError } from '@/types/CopilotApiError'
import APIError from '@api/core/exceptions/api'

type RequestHandler = (req: NextRequest, params: any) => Promise<NextResponse>

/**
 * Wraps a given request handler with a global error handler to standardize response structure
 * in case of failures. Catches exceptions thrown from the handler, and returns a formatted error response.
 *
 * @param {RequestHandler} handler - The request handler to wrap.
 * @returns {RequestHandler} The new handler that includes error handling logic.
 * @example
 * const safeHandler = withErrorHandler(async (req: NextRequest) => {
 *   // your request handling logic
 *   if (errorCondition) {
 *     throw new Error("Oh no!")}
 *   return NextResponse.next();
 * });
 *
 * @throws {ZodError} Captures and handles validation errors and responds with status 400 and the issue detail.
 * @throws {CopilotApiError} Captures and handles CopilotAPI errors, uses the error status, and message if available.
 * @throws {APIError} Captures and handles APIError
 */
export const withErrorHandler = (handler: RequestHandler): RequestHandler => {
  return async (req: NextRequest, params: any) => {
    try {
      return await handler(req, params)
    } catch (error) {
      console.error(error)

      let status = 500
      let message: string | ZodIssue[] = 'Something went wrong'

      if (error instanceof ZodError) {
        status = 422
        message = error.issues
      } else if (error instanceof CopilotApiError) {
        status = error.status || status
        message = error.body.message || message
      } else if (error instanceof APIError) {
        status = error.status
        message = error.message || message
      }

      return NextResponse.json({ error: message }, { status })
    }
  }
}
