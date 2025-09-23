import DBClient from '@/lib/db'
import { healthCheck } from '@/jobs/health-check'
import { tasks } from '@trigger.dev/sdk/v3'
import { NextResponse } from 'next/server'

export async function GET() {
  let dbConnection: boolean = false
  let triggerConnection: boolean = false
  let triggerRunId: string | undefined = undefined

  // Check database connection
  try {
    console.time('db')
    const client = DBClient.getInstance()
    await client.$queryRaw`SELECT 1`
    console.timeEnd('db')
    dbConnection = true
  } catch {}

  // Check trigger.dev workers connection
  try {
    console.time('trigger')
    const queueRunHandler = await tasks.trigger<typeof healthCheck>('health-check', {})
    console.timeEnd('trigger')
    triggerConnection = !!queueRunHandler?.id.startsWith('run')
    triggerRunId = queueRunHandler.id
  } catch {}

  return NextResponse.json({
    message: 'Assembly Tasks App API is rolling 🔥',
    dbConnection,
    triggerConnection,
    triggerRunId,
  })
}
