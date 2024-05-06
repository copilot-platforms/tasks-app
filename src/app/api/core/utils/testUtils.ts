import { NextRequest } from 'next/server'

export const buildNextRequest = (url: string) => new NextRequest(new Request('http://localhost:3000' + url), {})
