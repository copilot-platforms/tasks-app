import DBClient from '@/lib/db'
import { healthCheck } from '@/triggers/health-check'
import { tasks } from '@trigger.dev/sdk/v3'
import { NextResponse } from 'next/server'

export async function GET() {
  let dbConnection: boolean = false
  let triggerConnection: boolean = false

  // Check database connection
  try {
    const client = DBClient.getInstance()
    await client.$queryRaw`SELECT 1`
    dbConnection = true
  } catch {}

  // Check trigger.dev workers connection
  try {
    const queueRunHandler = await tasks.trigger<typeof healthCheck>('health-check', {})
    triggerConnection = !!queueRunHandler?.id.startsWith('run')
  } catch {}

  return NextResponse.json({
    message: 'Copilot Tasks App API is rolling 🔥',
    dbConnection,
    triggerConnection,
  })
}
