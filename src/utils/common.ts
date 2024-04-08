import { NextResponse } from 'next/server'
import { CopilotApiError } from '@/types/CopilotApiError'

export function respondError(message: string, status: number = 500) {
  return NextResponse.json({ message }, { status })
}

export function handleError(error: unknown) {
  console.error(error)
  let apiError = {
    message: 'Something went wrong',
    status: 500,
  }
  if (error instanceof CopilotApiError) {
    apiError = {
      status: error.status,
      message: error.body.message,
    }
  }

  return respondError(apiError.message, apiError.status)
}
