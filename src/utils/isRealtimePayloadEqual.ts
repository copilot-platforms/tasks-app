import { RealTimeTaskResponse } from '@/hoc/RealTime'
import { RealTimeTemplateResponse } from '@/hoc/RealtimeTemplates'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import deepEqual from 'deep-equal'

export function isPayloadEqual(
  payload: RealtimePostgresChangesPayload<RealTimeTaskResponse | RealTimeTemplateResponse>,
): boolean {
  const newPayload = payload.new
  const oldPayload = payload.old
  if (!newPayload || !oldPayload) return true
  return deepEqual(newPayload, oldPayload)
}
