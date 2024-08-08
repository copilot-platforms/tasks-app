import { NextResponse, NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const requestHeaders = new Headers(request.headers)
  if (token) {
    requestHeaders.set('clientToken', token)
  }
  return NextResponse.next({ request: { headers: requestHeaders } })
}
