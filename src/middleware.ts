import { NextRequest, NextResponse } from 'next/server'
import { apiUrl, copilotAPIKey } from './config'

export const config = {
  matcher: '/api/tasks/:path*',
}

export async function middleware(req: NextRequest) {
  const method = req.method
  const token = req.nextUrl.searchParams.get('token')
  const res = await fetch(`${apiUrl}/api/middleware-authenticator?token=${token}&apiKey=${copilotAPIKey}`, {
    method: 'POST',
  })
  const user = await res.json()

  if (method === 'POST') {
    return NextResponse.next()
  }

  if (method === 'PATCH') {
    const inputString = req.nextUrl.pathname
    const pattern = /\/api\/tasks\/([^\/]+)/
    const match = inputString.match(pattern)
    if (match) {
      const taskId = match[1]
      const task = await req.json()

      await fetch(`${apiUrl}/api/activity/${taskId}?apiKey=${copilotAPIKey}`, {
        method: 'POST',
        body: JSON.stringify({
          user: user,
          task: task,
        }),
      })

      return NextResponse.next()
    }
  }

  return NextResponse.next()
}
