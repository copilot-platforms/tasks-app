import { NextRequest, NextResponse } from 'next/server'
import APIError from '@api/core/exceptions/api'
import { ZodError, ZodIssue } from 'zod'
import { CopilotApiError } from '@/types/CopilotApiError'

type RequestHandler = (req: NextRequest, params: any) => Promise<NextResponse>

export const withErrorHandler = (handler: RequestHandler): RequestHandler => {
  return async (req: NextRequest, params: any) => {
    try {
      return await handler(req, params)
    } catch (error) {
      console.error(error)

      let status = 500
      let message: string | ZodIssue[] = 'Something went wrong'

      if (error instanceof ZodError) {
        status = 400
        message = error.issues
      } else if (error instanceof CopilotApiError) {
        status = error.status || status
        message = error.body.message || message
      }

      return NextResponse.json({ error: message }, { status })
    }
  }
}
