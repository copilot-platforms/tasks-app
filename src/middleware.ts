import { NextResponse, NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token')
  const requestHeaders = new Headers(request.headers)
  if (token) {
    requestHeaders.set('clientToken', token)
  }
  return NextResponse.next({ request: { headers: requestHeaders } })
}
