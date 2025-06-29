import { NextResponse } from 'next/server'
import { CopilotApiError } from '@/types/CopilotApiError'

export const respondError = (message: string, status: number = 500): NextResponse => {
  return NextResponse.json({ message }, { status })
}

export const handleError = (error: unknown): NextResponse => {
  console.error(error)
  if (error instanceof CopilotApiError) {
    return respondError(error.body.message, error.status)
  }
  return respondError('Something went wrong', 500)
}
