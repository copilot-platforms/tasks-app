import { NextRequest } from 'next/server'

export const buildNextRequest = (url: string) => new NextRequest(new Request(process.env.VERCEL_URL + url), {})
