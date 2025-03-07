import { ReplyResponse } from '@/app/api/activity-logs/schemas/CommentAddedSchema'
import { LogResponse } from '@/app/api/activity-logs/schemas/LogResponseSchema'
import { ActivityType } from '@prisma/client'

export interface OptimisticUpdate {
  tempId: string
  serverId?: string
  timestamp: number
}

//util to maintain same key for collapse animation on optimistic updates
export const checkOptimisticStableId = (log: LogResponse | ReplyResponse, optimisticUpdates: OptimisticUpdate[]) => {
  const referenceId = 'details' in log ? (log.details.id ?? log.id) : log.id
  const matchingUpdate = optimisticUpdates.find((update) => update.tempId === log.id || update.serverId === referenceId)
  return matchingUpdate ? matchingUpdate.tempId : log.id
}
