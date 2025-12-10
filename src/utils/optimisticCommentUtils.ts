import { ReplyResponse } from '@/app/api/activity-logs/schemas/CommentAddedSchema'
import { LogResponse } from '@/app/api/activity-logs/schemas/LogResponseSchema'
import { ClientResponseSchema, ClientsResponse, InternalUsers, InternalUsersSchema } from '@/types/common'
import { CreateComment } from '@/types/dto/comment.dto'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { IAssigneeCombined, ITemplate } from '@/types/interfaces'
import { ActivityType } from '@prisma/client'
import { z } from 'zod'

export interface OptimisticUpdate {
  tempId: string
  serverId?: string
  timestamp: number
}

//util to maintain same key for collapse animation on optimistic updates. The optimistic updates are data reflected on the ui which are yet to be uploaded on the server.
//Once the optimistic data gets updated on the server, we need to replace the tempId with the actual id from server. But if key changes unexpectedly or frequently on the Collapse or other animation components, the animation may break or cause flicker. By maintaining consistent key through tempId or serverId, the component remains stable and ensures animations work correctly.
export const checkOptimisticStableId = (
  log: LogResponse | ReplyResponse | TaskResponse | ITemplate,
  optimisticUpdates: OptimisticUpdate[],
) => {
  const referenceId = 'details' in log ? (log.details.id ?? log.id) : log.id
  const matchingUpdate = optimisticUpdates.find((update) => update.tempId === log.id || update.serverId === referenceId)
  return matchingUpdate?.tempId ?? log.id
}

//generates temp log for optimistic updates of comments/replies.
export const getTempLog = (
  tempId: string,
  postCommentPayload: CreateComment,
  task_id: string,
  userDetails: IAssigneeCombined | undefined,
  userId: string | undefined,
): LogResponse | ReplyResponse | {} => {
  const userDetailsParsed = z.union([InternalUsersSchema, ClientResponseSchema]).safeParse(userDetails)
  if (!userDetailsParsed.success || !userDetailsParsed.data) {
    console.error('Failed to parse user details:', userDetailsParsed)
    return {}
  }
  const currentUserDetails = userDetailsParsed.data
  return postCommentPayload.parentId
    ? {
        id: tempId,
        content: postCommentPayload.content,
        taskId: task_id,
        parentId: postCommentPayload.parentId,
        workspaceId: '',
        initiatorId: currentUserDetails.id as string,
        initiator: {
          status: '',
          id: currentUserDetails.id as string,
          givenName: currentUserDetails.givenName || '',
          familyName: currentUserDetails.familyName || '',
          email: currentUserDetails.email || '',
          companyId: '',
          avatarImageUrl: currentUserDetails.avatarImageUrl || null,
          customFields: {},
          fallbackColor: currentUserDetails.fallbackColor || null,
          createdAt: currentUserDetails.createdAt || new Date().toISOString(),
          isClientAccessLimited: false,
          companyAccessList: null,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    : {
        id: tempId,
        type: ActivityType.COMMENT_ADDED,
        details: {
          content: postCommentPayload.content,
          id: tempId,
          replies: [],
        },
        taskId: task_id,
        userId: userId as string,
        userRole: 'internalUser',
        workspaceId: '',
        initiator: {
          status: '',
          id: currentUserDetails.id as string,
          givenName: currentUserDetails.givenName || '',
          familyName: currentUserDetails.familyName || '',
          email: currentUserDetails.email || '',
          companyId: '',
          avatarImageUrl: currentUserDetails.avatarImageUrl || null,
          customFields: {},
          fallbackColor: currentUserDetails.fallbackColor || null,
          createdAt: currentUserDetails.createdAt || new Date().toISOString(),
          isClientAccessLimited: false,
          companyAccessList: null,
        },
        createdAt: new Date().toISOString(),
      }
}

//appends optimistic data on activity lists.
export const getOptimisticData = (
  postCommentPayload: CreateComment,
  activities: LogResponse[] | undefined,
  tempLog: LogResponse | ReplyResponse | {},
) => {
  let optimisticData
  if (postCommentPayload.parentId) {
    if (!activities) return []
    optimisticData = activities.map((comment: LogResponse) => {
      if (comment.details.id === postCommentPayload.parentId) {
        const updatedReplies = [
          ...(comment.details.replies as ReplyResponse[]),
          { ...tempLog, parentId: postCommentPayload.parentId },
        ]

        return {
          ...comment,
          replies: updatedReplies,
          details: {
            ...comment.details,
            replies: updatedReplies,
          },
        }
      }
      return comment
    })
  } else {
    optimisticData = activities ? [...activities, tempLog] : [tempLog]
  }

  return optimisticData
}
