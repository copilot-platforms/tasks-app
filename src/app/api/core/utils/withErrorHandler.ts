import { NextRequest, NextResponse } from 'next/server'
import { ZodError, ZodFormattedError, ZodIssue } from 'zod'
import { CopilotApiError } from '@/types/CopilotApiError'
import APIError from '@api/core/exceptions/api'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import httpStatus from 'http-status'

type RequestHandler = (req: NextRequest, params: any) => Promise<NextResponse>

/**
 * Reusable utility that wraps a given request handler with a global error handler to standardize response structure
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
    // Execute the handler wrapped in a try... catch block
    try {
      return await handler(req, params)
    } catch (error: unknown) {
      // Format error in a readable way
      let formattedError = error
      if (error instanceof ZodError) {
        formattedError = error.format() as ZodFormattedError<string, unknown>
      }
      console.error(formattedError)

      // Default staus and message for JSON error response
      let status: number = httpStatus.BAD_REQUEST
      let message: string | ZodFormattedError<string> = 'Something went wrong'
      let errors: unknown[] | undefined = undefined

      // Build a proper response based on the type of Error encountered
      if (error instanceof ZodError) {
        status = httpStatus.UNPROCESSABLE_ENTITY
        message = formattedError as ZodFormattedError<string, unknown>
      } else if (error instanceof CopilotApiError) {
        status = error.status || status
        message = error.body.message || message
      } else if (error instanceof APIError) {
        status = error.status
        message = error.message || message
        errors = error.errors
      } else if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Code for NOT FOUND in Prisma
          status = httpStatus.NOT_FOUND
          message = 'The requested resource was not found'
        }
      }

      return NextResponse.json({ error: message, errors }, { status })
    }
  }
}
