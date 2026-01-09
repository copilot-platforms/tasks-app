import { RealTimeTaskResponse } from '@/hoc/RealTime'
import { RealTimeTemplateResponse } from '@/hoc/RealtimeTemplates'

type TimestampKeys<T> = Extract<keyof T, string>

function formatTimestamps<T extends Record<string, any>>(obj: T, keys: TimestampKeys<T>[]): T {
  const formatted: Partial<T> = { ...obj }

  keys.forEach((key) => {
    const value = obj[key]
    if (typeof value === 'string') {
      formatted[key] = new Date(value + 'Z').toISOString() as any
    }
  })

  return formatted as T
}

export function getFormattedTask(task: unknown): RealTimeTaskResponse {
  return formatTimestamps<RealTimeTaskResponse>(task as RealTimeTaskResponse, [
    'createdAt',
    'updatedAt',
    'lastActivityLogUpdated',
    'lastSubtaskUpdated',
  ])
}

export function getFormattedTemplate(template: unknown): RealTimeTemplateResponse {
  return formatTimestamps<RealTimeTemplateResponse>(template as RealTimeTemplateResponse, ['createdAt', 'updatedAt'])
}
