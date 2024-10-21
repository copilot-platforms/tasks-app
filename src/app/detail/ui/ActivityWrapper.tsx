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
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { generateRandomString } from '@/utils/generateRandomString'
import { z } from 'zod'

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
  createdAt: number
}

export const ActivityWrapper = ({ token, task_id }: { token: string; task_id: string }) => {
  const { data, isLoading } = useSWR(`/api/tasks/${task_id}/activity-logs/?token=${token}`, fetcher, {
    refreshInterval: 10000,
  })
  const { tokenPayload } = useSelector(selectAuthDetails)
  const { assignee } = useSelector(selectTaskBoard)
  const currentUserId = tokenPayload?.clientId ?? tokenPayload?.internalUserId
  const currentUserDetails = assignee.find((el) => el.id === currentUserId)

  // The activities state can hold both LogResponse and TempCommentType
  const [activities, setActivities] = useState<(LogResponse | TempCommentType)[]>([])

  // Sync state with fetched data only if the data changes
  useEffect(() => {
    if (data) {
      setActivities(data.data)
    }
  }, [data])

  const [isFirstPageLoad, setIsFirstPageLoad] = useState(true)

  const searchParams = useSearchParams()
  const commentId = searchParams.get('commentId')

  useEffect(() => {
    if (isFirstPageLoad && activities && commentId) {
      const commentElement = document.getElementById(commentId)
      if (commentElement) {
        commentElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      setIsFirstPageLoad(false) // Mark it false after first page load
    }
  }, [commentId, activities, isFirstPageLoad])

  const handleCreateComment = async (postCommentPayload: CreateComment) => {
    const tempComment: TempCommentType = {
      type: ActivityType.COMMENT_ADDED,
      id: generateRandomString('temp-comment'),
      initiator: {
        id: z.string().parse(currentUserDetails?.id),
        givenName: z.string().parse(currentUserDetails?.givenName),
        familyName: z.string().parse(currentUserDetails?.familyName),
        avatarImageUrl: z.string().parse(currentUserDetails?.avatarImageUrl),
      },
      details: {
        content: postCommentPayload.content,
      },
      createdAt: Date.now(),
    }

    // Optimistically add the comment to the activity list
    setActivities((prev) => [...prev, tempComment])

    try {
      await postComment(token, postCommentPayload)
    } catch (error) {
      console.error('Failed to post comment:', error)
      // Optionally, remove temp comment if posting fails
    }
  }

  const handleDeleteComment = async (id: string) => {
    // Optimistically remove the comment from the activity list
    setActivities((prev) => prev.filter((el) => el.id !== id))

    try {
      await deleteComment(token, id)
    } catch (error) {
      console.error('Failed to delete comment:', error)
      // Optionally, re-add the comment to the list if deletion fails
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
            {activities?.map((item) => (
              <Box
                key={item.id}
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
                    deleteComment={() => handleDeleteComment(item.id)}
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
