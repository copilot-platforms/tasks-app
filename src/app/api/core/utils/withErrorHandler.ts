import { NextRequest, NextResponse } from 'next/server'
import APIError from '@api/core/exceptions/api'

type RequestHandler = (req: NextRequest, params: any) => Promise<NextResponse>

export const withErrorHandler = (handler: RequestHandler): RequestHandler => {
  return async (req: NextRequest, params: any) => {
    try {
      return await handler(req, params)
    } catch (err) {
      console.error(err)
      let error = 'Something went wrong'
      let status = 500
      if (err instanceof APIError) {
        error = err.message
        status = err.status
      }
      return NextResponse.json({ error }, { status })
    }
  }
}
