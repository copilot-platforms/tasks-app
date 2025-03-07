'use client'

import { deleteComment, postComment } from '@/app/detail/[task_id]/[user_type]/actions'
import { ActivityLog } from '@/app/detail/ui/ActivityLog'
import { Comments } from '@/app/detail/ui/Comments'
import { CommentInput } from '@/components/inputs/CommentInput'
import useScrollToElement from '@/hooks/useScrollToElement'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { ClientResponseSchema, InternalUsersSchema, Token } from '@/types/common'
import { CreateComment } from '@/types/dto/comment.dto'
import { fetcher } from '@/utils/fetcher'
import { generateRandomString } from '@/utils/generateRandomString'
import { LogResponse } from '@api/activity-logs/schemas/LogResponseSchema'
import { Box, Collapse, Skeleton, Stack, Typography } from '@mui/material'
import { ActivityType } from '@prisma/client'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import useSWR, { useSWRConfig } from 'swr'
import { z } from 'zod'
import { TransitionGroup } from 'react-transition-group'
import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { ReplyResponse } from '@/app/api/activity-logs/schemas/CommentAddedSchema'
import { checkOptimisticStableId } from '@/utils/checkOptimisticStableId'

interface OptimisticUpdate {
  tempId: string
  serverId?: string
  timestamp: number
}

export const ActivityWrapper = ({
  token,
  task_id,
  tokenPayload,
}: {
  token: string
  task_id: string
  tokenPayload: Token
}) => {
  const { activeTask } = useSelector(selectTaskBoard)
  const { expandedComments } = useSelector(selectTaskDetails)
  const task = activeTask
  const [lastUpdated, setLastUpdated] = useState(task?.lastActivityLogUpdated)
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate[]>([])
  const expandedCommentsQueryString = expandedComments.map((id) => encodeURIComponent(id)).join(',')
  const cacheKey = `/api/tasks/${task_id}/activity-logs?token=${token}`
  const { data: activities, isLoading } = useSWR(`/api/tasks/${task_id}/activity-logs?token=${token}`, fetcher, {
    refreshInterval: 0,
  })
  const { assignee } = useSelector(selectTaskBoard)
  const { mutate } = useSWRConfig()
  useScrollToElement('commentId')
  useEffect(() => {
    const refetchActivityLog = async () => {
      await mutate(cacheKey)
      setLastUpdated(task?.lastActivityLogUpdated)
    }
    if (lastUpdated !== task?.lastActivityLogUpdated) {
      refetchActivityLog()
    }
  }, [task?.lastActivityLogUpdated])

  const currentUserId = tokenPayload.internalUserId ?? tokenPayload.clientId

  const currentUserDetails = useMemo(() => {
    const currentAssignee = assignee.find((el) => el.id === currentUserId)
    if (!currentAssignee) {
      return
    }
    return z.union([InternalUsersSchema, ClientResponseSchema]).parse(assignee.find((el) => el.id === currentUserId))
  }, [assignee, currentUserId])

  // Handle comment creation
  const handleCreateComment = async (postCommentPayload: CreateComment) => {
    const tempId = generateRandomString('temp-comment')

    setOptimisticUpdates((prev) => [
      ...prev,
      {
        tempId,
        timestamp: Date.now(),
      },
    ])

    const tempLog: LogResponse | ReplyResponse = postCommentPayload.parentId
      ? {
          id: tempId,
          content: postCommentPayload.content,
          taskId: task_id,
          parentId: postCommentPayload.parentId,
          workspaceId: '',
          initiatorId: currentUserDetails?.id as string,
          initiator: {
            status: '',
            id: currentUserDetails?.id as string,
            givenName: currentUserDetails?.givenName || '',
            familyName: currentUserDetails?.familyName || '',
            email: currentUserDetails?.email || '',
            companyId: '',
            avatarImageUrl: currentUserDetails?.avatarImageUrl || null,
            customFields: {},
            fallbackColor: currentUserDetails?.fallbackColor || null,
            createdAt: currentUserDetails?.createdAt || new Date().toISOString(),
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
          },
          taskId: task_id,
          userId: currentUserId as string,
          userRole: 'internalUser',
          workspaceId: '',
          initiator: {
            status: '',
            id: currentUserDetails?.id as string,
            givenName: currentUserDetails?.givenName || '',
            familyName: currentUserDetails?.familyName || '',
            email: currentUserDetails?.email || '',
            companyId: '',
            avatarImageUrl: currentUserDetails?.avatarImageUrl || null,
            customFields: {},
            fallbackColor: currentUserDetails?.fallbackColor || null,
            createdAt: currentUserDetails?.createdAt || new Date().toISOString(),
            isClientAccessLimited: false,
            companyAccessList: null,
          },
          createdAt: new Date().toISOString(),
        }

    let optimisticData
    if (postCommentPayload.parentId) {
      optimisticData = activities
        ? activities.data.map((comment: LogResponse) => {
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
        : []
    } else {
      optimisticData = activities ? [...activities.data, tempLog] : [tempLog]
    }

    try {
      mutate(
        cacheKey,
        async () => {
          // Post the actual comment to the server
          const comment = await postComment(token, postCommentPayload)
          setOptimisticUpdates((prev) =>
            prev.map((update) => (update.tempId === tempId ? { ...update, serverId: comment.id } : update)),
          )
          // Return the actual updated data (this will trigger revalidation)
          return await fetcher(cacheKey)
        },
        {
          optimisticData: { data: optimisticData },
          rollbackOnError: true,
          revalidate: true, // Make sure to revalidate after mutation
        },
      )
    } catch (error) {
      console.error('Failed to post comment:', error)
      setOptimisticUpdates((prev) => prev.filter((update) => update.tempId !== tempId))
    }
  }

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string, logId: string, replyId?: string) => {
    let optimisticData
    if (replyId) {
      optimisticData = activities
        ? activities.data.map((item: LogResponse) => {
            if (item.id === logId) {
              const updatedReplies = (item.details.replies as ReplyResponse[]).filter(
                (reply: ReplyResponse) => reply.id !== replyId,
              )
              return {
                ...item,
                details: {
                  ...item.details,
                  replies: updatedReplies,
                },
              }
            }
            return item
          })
        : []
    } else {
      optimisticData = activities ? activities.data.filter((comment: LogResponse) => comment.id !== logId) : []
    }

    try {
      await mutate(
        cacheKey,
        async () => {
          // Delete the comment from the server
          await deleteComment(token, commentId)
          // Return the actual updated data (this will trigger revalidation)
          return await fetcher(cacheKey)
        },
        {
          optimisticData: { data: optimisticData },
          rollbackOnError: true,
          revalidate: true, // Make sure to revalidate after mutation
        },
      )
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  return (
    <Box width="100%">
      <Stack direction="column" alignItems="left" p="16px 0px" rowGap={4}>
        <Typography variant="lg">Activity</Typography>
        {isLoading ? (
          <Stack direction="column" rowGap={5}>
            <Skeleton variant="rectangular" width={'100%'} height={15} />
            <Skeleton variant="rectangular" width={'100%'} height={15} />
            <Skeleton variant="rectangular" width={'100%'} height={15} />
          </Stack>
        ) : (
          <Stack direction="column" alignItems="left" rowGap={2}>
            <TransitionGroup>
              {activities?.data?.map((item: LogResponse, index: number) => (
                <Collapse key={checkOptimisticStableId(item, optimisticUpdates)}>
                  <Box
                    key={index}
                    sx={{
                      height: 'auto',
                    }}
                  >
                    {item.type === ActivityType.COMMENT_ADDED ? (
                      <Comments
                        comment={item}
                        createComment={handleCreateComment}
                        deleteComment={(commentId, replyId) => handleDeleteComment(commentId, item.id, replyId)}
                        task_id={task_id}
                        stableId={item.id}
                        optimisticUpdates={optimisticUpdates}
                      />
                    ) : (
                      <ActivityLog log={item} />
                    )}
                  </Box>
                </Collapse>
              ))}
            </TransitionGroup>
            <CommentInput createComment={handleCreateComment} task_id={task_id} />
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
