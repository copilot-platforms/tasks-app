import { RealTimeTaskResponse } from '@/hoc/RealTime'
import { RealTimeTemplateResponse } from '@/hoc/RealtimeTemplates'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import deepEqual from 'deep-equal'

export function isTaskPayloadEqual(
  payload: RealtimePostgresChangesPayload<RealTimeTaskResponse | RealTimeTemplateResponse>,
): boolean {
  const newPayload = payload.new
  const oldPayload = payload.old
  if (!newPayload || !oldPayload) return true
  return deepEqual(newPayload, oldPayload)
}

export function isTemplatePayloadEqual(payload: RealtimePostgresChangesPayload<RealTimeTemplateResponse>): boolean {
  const { new: n, old: o } = payload

  const hasRequiredFields = (obj: {} | RealTimeTemplateResponse): obj is RealTimeTemplateResponse =>
    typeof obj === 'object' &&
    obj !== null &&
    'title' in obj &&
    'body' in obj &&
    'workflowStateId' in obj &&
    'deletedAt' in obj

  if (!hasRequiredFields(n) || !hasRequiredFields(o)) {
    return false
  }

  return n.title === o.title && n.body === o.body && n.workflowStateId === o.workflowStateId && n.deletedAt === o.deletedAt
}
