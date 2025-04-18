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
import { checkOptimisticStableId, getOptimisticData, getTempLog } from '@/utils/optimisticCommentUtils'
import { IAssigneeCombined } from '@/types/interfaces'

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
    return currentAssignee
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

    const tempLog = getTempLog(tempId, postCommentPayload, task_id, currentUserDetails, currentUserId)
    const optimisticData = getOptimisticData(postCommentPayload, activities.data, tempLog)

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
  const handleDeleteComment = async (commentId: string, logId: string, replyId?: string, softDelete?: boolean) => {
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
      if (softDelete) {
        optimisticData = activities
          ? activities.data.map((comment: LogResponse) => {
              if (comment.id === logId) {
                return {
                  ...comment,
                  details: {
                    ...comment.details,
                    deletedAt: new Date().toISOString(),
                  },
                }
              }
              return comment
            })
          : []
      } else {
        optimisticData = activities ? activities.data.filter((comment: LogResponse) => comment.id !== logId) : []
      }
    }

    try {
      await mutate(
        cacheKey,
        async () => {
          let commentIdToDelete = commentId
          if (commentIdToDelete.includes('temp-comment')) {
            const maxAttempts = 6
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
              const matchedUpdate = optimisticUpdates.find((update) => update.tempId === commentIdToDelete)
              if (matchedUpdate?.serverId) {
                commentIdToDelete = matchedUpdate.serverId
                break
              }
              await new Promise((resolve) => setTimeout(resolve, 500))
            }
            if (commentIdToDelete.includes('temp-comment')) {
              console.warn('Comment is still pending server sync. Try again later.')
              return activities
            }
          } //Due to optimistic updates on comment creation applied in our ui, some deleted comments might have tempId which are yet to be replaced by the server id. Although the usecase frequency for this is very very minimal, we are waiting for serverId to replace tempId if the deleted comment has tempId by polling method.

          await deleteComment(token, commentIdToDelete)
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
      <Stack direction="column" alignItems="left" p="24px 0px" rowGap={'12px'}>
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
                        deleteComment={(commentId, replyId, softDelete) =>
                          handleDeleteComment(commentId, item.id, replyId, softDelete)
                        }
                        task_id={task_id}
                        stableId={z.string().parse(item.details.id) ?? item.id}
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
