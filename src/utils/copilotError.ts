import { MessagableError } from '@/types/CopilotApiError'

export const isMessagableError = (e: unknown): e is MessagableError => {
  return (
    typeof e === 'object' && e !== null && 'message' in e && (!('body' in e) || typeof (e as any).body?.message === 'string')
  )
}
