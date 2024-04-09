import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Copilot Tasks app API is rolling 🔥',
  })
}
