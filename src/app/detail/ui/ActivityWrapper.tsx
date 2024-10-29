'use client'

import { useMemo, useState } from 'react'
import { LogResponse } from '@/app/api/activity-logs/schemas/LogResponseSchema'
import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { Comments } from './Comments'
import { ActivityLog } from '@/app/detail/ui/ActivityLog'
import { CommentInput } from '@/components/inputs/CommentInput'
import { ActivityType } from '@prisma/client'
import { postComment, deleteComment } from '../[task_id]/[user_type]/actions'
import { CreateComment } from '@/types/dto/comment.dto'
import { fetcher } from '@/utils/fetcher'
import useSWR, { useSWRConfig } from 'swr'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { generateRandomString } from '@/utils/generateRandomString'
import { z } from 'zod'
import { ClientResponseSchema, InternalUsersSchema, Token } from '@/types/common'

export const ActivityWrapper = ({
  token,
  task_id,
  tokenPayload,
}: {
  token: string
  task_id: string
  tokenPayload: Token
}) => {
  const [logsUpdateCounter, setLogsUpdateCounter] = useState(0)
  const { data: activities, isLoading } = useSWR(
    [`/api/tasks/${task_id}/activity-logs?token=${token}`, logsUpdateCounter],
    ([url]) => fetcher(url),
    {
      refreshInterval: 0,
    },
  )
  const { assignee } = useSelector(selectTaskBoard)
  const { mutate } = useSWRConfig()
  const currentUserId = tokenPayload.clientId ?? tokenPayload.internalUserId

  const currentUserDetails = useMemo(() => {
    const currentAssignee = assignee.find((el) => el.id === currentUserId)
    if (!currentAssignee) {
      return
    }
    return z.union([InternalUsersSchema, ClientResponseSchema]).parse(assignee.find((el) => el.id === currentUserId))
  }, [assignee, currentUserId])

  const cacheKey = `/api/tasks/${task_id}/activity-logs?token=${token}`

  // Handle comment creation
  const handleCreateComment = async (postCommentPayload: CreateComment) => {
    const tempLog: LogResponse = {
      id: generateRandomString('temp-comment'),
      type: ActivityType.COMMENT_ADDED,
      details: {
        content: postCommentPayload.content,
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

    const optimisticData = activities ? [...activities.data, tempLog] : [tempLog]
    try {
      mutate(
        cacheKey,
        async () => {
          // Post the actual comment to the server
          await postComment(token, postCommentPayload)
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
    }
  }

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string, logId: string) => {
    const optimisticData = activities ? activities.data.filter((comment: LogResponse) => comment.id !== logId) : []

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
      <Stack direction="column" alignItems="left" p="12px 0px" rowGap={5}>
        <Typography variant="lg">Activity</Typography>
        {isLoading ? (
          <Stack direction="column" rowGap={5}>
            <Skeleton variant="rectangular" width={'100%'} height={15} />
            <Skeleton variant="rectangular" width={'100%'} height={15} />
            <Skeleton variant="rectangular" width={'100%'} height={15} />
          </Stack>
        ) : (
          <Stack direction="column" alignItems="left" rowGap={4}>
            {activities?.data?.map((item: LogResponse, index: number) => (
              <Box
                key={index}
                sx={{
                  height: 'auto',
                  display:
                    item.type === ActivityType.TASK_CREATED || item.type === ActivityType.COMMENT_ADDED ? 'block' : 'none',
                }}
              >
                {item.type === ActivityType.COMMENT_ADDED ? (
                  <Comments
                    comment={item}
                    createComment={handleCreateComment}
                    deleteComment={(commentId) => handleDeleteComment(commentId, item.id)}
                    task_id={task_id}
                  />
                ) : (
                  item.type === ActivityType.TASK_CREATED && <ActivityLog log={item} />
                )}
              </Box>
            ))}

            <CommentInput createComment={handleCreateComment} task_id={task_id} />
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
