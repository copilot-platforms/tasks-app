'use client'

import { LogResponse } from '@/app/api/activity-logs/schemas/LogResponseSchema'
import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { Comments } from './Comments'
import { ActivityLog } from '@/app/detail/ui/ActivityLog'
import { CommentInput } from '@/components/inputs/CommentInput'
import { ActivityType } from '@prisma/client'
import { postComment, deleteComment } from '../[task_id]/[user_type]/actions'
import { CreateComment } from '@/types/dto/comment.dto'
import { fetcher } from '@/utils/fetcher'
import useSWR from 'swr'
import { useDeferredValue, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { generateRandomString } from '@/utils/generateRandomString'
import { mutate } from 'swr'

export type TempCommentType = {
  id: string
  type: ActivityType // Assuming you only handle comments
  initiator: {
    id?: string // User details may be incomplete in temp comments
    givenName?: string
    familyName?: string
    avatarImageUrl?: string
  }
  details: {
    content: string
  }
  createdAt: string
}

export const ActivityWrapper = ({ token, task_id }: { token: string; task_id: string }) => {
  const { data: activities, isLoading } = useSWR(`/api/tasks/${task_id}/activity-logs/?token=${token}`, fetcher, {
    refreshInterval: 10_000,
  })
  const { tokenPayload } = useSelector(selectAuthDetails)
  const { assignee } = useSelector(selectTaskBoard)
  const currentUserId = tokenPayload?.clientId ?? tokenPayload?.internalUserId
  const currentUserDetails = assignee.find((el) => el.id === currentUserId)

  const handleCreateComment = async (postCommentPayload: CreateComment) => {
    const tempComment: TempCommentType = {
      type: ActivityType.COMMENT_ADDED,
      id: generateRandomString('temp-comment'),
      initiator: {
        id: currentUserDetails?.id,
        givenName: currentUserDetails?.givenName,
        familyName: currentUserDetails?.familyName,
        avatarImageUrl: currentUserDetails?.avatarImageUrl,
      },
      details: {
        content: postCommentPayload.content,
      },
      createdAt: new Date().toISOString(),
    }

    // Optimistically update the SWR cache
    const cacheKey = `/api/tasks/${task_id}/activity-logs/?token=${token}`

    // Optimistic UI update
    mutate(
      cacheKey,
      (currentData: { data: (LogResponse | TempCommentType)[] } | undefined) => {
        if (!currentData) {
          return { data: [tempComment] } // Start with the temp comment
        }
        return {
          data: [...currentData.data, tempComment],
        }
      },
      false, // Do not revalidate immediately
    )

    try {
      // Send the comment to the server
      await postComment(token, postCommentPayload)

      // After the comment is successfully posted, revalidate
      mutate(cacheKey)
    } catch (error) {
      console.error('Failed to post comment:', error)

      // Optionally revert the optimistic update if the request fails
      // You may want to use a more graceful error handling approach here
      mutate(cacheKey) // Revalidate to restore previous state
    }
  }

  const handleDeleteComment = async (commentId: string, logId: string) => {
    // Optimistically remove the comment from the SWR cache
    mutate(
      `/api/tasks/${task_id}/activity-logs/?token=${token}`,
      async (currentData: { data: (LogResponse | TempCommentType)[] } | undefined) => {
        if (!currentData) {
          return { data: [] } // No data to filter if it's undefined
        }
        return {
          data: currentData.data.filter((el) => el.id !== logId),
        }
      },
      false,
    )

    try {
      await deleteComment(token, commentId)
      mutate(`/api/tasks/${task_id}/activity-logs/?token=${token}`) // Revalidate cache after success
    } catch (error) {
      console.error('Failed to delete comment:', error)
      // Optionally revert the optimistic update if the request fails
      mutate(`/api/tasks/${task_id}/activity-logs/?token=${token}`)
    }
  }

  return (
    <Box width="100%">
      <Stack direction="column" alignItems="left" p="10px 5px" rowGap={5}>
        <Typography variant="lg">Activity</Typography>
        {isLoading ? (
          <Stack direction="column" rowGap={5}>
            <Skeleton variant="rectangular" width={'100%'} height={15} />
            <Skeleton variant="rectangular" width={'100%'} height={15} />
            <Skeleton variant="rectangular" width={'100%'} height={15} />
          </Stack>
        ) : (
          <Stack direction="column" alignItems="left" p="0px 5px" rowGap={4}>
            {activities.data?.map((item: LogResponse, index: number) => (
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
