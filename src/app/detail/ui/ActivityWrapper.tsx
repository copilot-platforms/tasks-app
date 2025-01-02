'use client'

import { LogResponse } from '@/app/api/activity-logs/schemas/LogResponseSchema'
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
import { Box, Collapse, Skeleton, Stack, Typography } from '@mui/material'
import { ActivityType } from '@prisma/client'
import { useEffect, useMemo, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import useSWR, { useSWRConfig } from 'swr'
import { z } from 'zod'
import { TransitionGroup } from 'react-transition-group'

export const ActivityWrapper = ({
  token,
  task_id,
  tokenPayload,
}: {
  token: string
  task_id: string
  tokenPayload: Token
}) => {
  const { tasks } = useSelector(selectTaskBoard)
  const task = tasks.find((task) => task.id === task_id)
  const [lastUpdated, setLastUpdated] = useState(task?.lastActivityLogUpdated)
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)
  const optimisticUpdatesRef = useRef(new Set<string>())
  const previousActivitiesRef = useRef<LogResponse[]>([])

  const cacheKey = `/api/tasks/${task_id}/activity-logs?token=${token}`

  const { data: activities, isLoading } = useSWR(cacheKey, fetcher, {
    refreshInterval: 0,
  })

  const { assignee } = useSelector(selectTaskBoard)
  const { mutate } = useSWRConfig()
  useScrollToElement('commentId')

  // Set initial data once it's loaded
  useEffect(() => {
    if (activities?.data && !initialDataLoaded) {
      previousActivitiesRef.current = activities.data
      setInitialDataLoaded(true)
    }
  }, [activities?.data])

  useEffect(() => {
    const refetchActivityLog = async () => {
      await mutate(cacheKey)
      setLastUpdated(task?.lastActivityLogUpdated)
    }

    refetchActivityLog()
  }, [task?.lastActivityLogUpdated])

  const currentUserId = tokenPayload.internalUserId ?? tokenPayload.clientId

  const currentUserDetails = useMemo(() => {
    const currentAssignee = assignee.find((el) => el.id === currentUserId)
    if (!currentAssignee) {
      return
    }
    return z.union([InternalUsersSchema, ClientResponseSchema]).parse(assignee.find((el) => el.id === currentUserId))
  }, [assignee, currentUserId])

  const handleCreateComment = async (postCommentPayload: CreateComment) => {
    const tempId = generateRandomString('temp-comment')
    optimisticUpdatesRef.current.add(tempId)

    const tempLog: LogResponse = {
      id: tempId,
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
    previousActivitiesRef.current = activities?.data || []

    try {
      await mutate(
        cacheKey,
        async () => {
          await postComment(token, postCommentPayload)
          const newData = await fetcher(cacheKey)
          optimisticUpdatesRef.current.delete(tempId)
          return newData
        },
        {
          optimisticData: { data: optimisticData },
          rollbackOnError: true,
          revalidate: false,
        },
      )
    } catch (error) {
      optimisticUpdatesRef.current.delete(tempId)
      console.error('Failed to post comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string, logId: string) => {
    previousActivitiesRef.current = activities?.data || []
    const optimisticData = activities ? activities.data.filter((comment: LogResponse) => comment.id !== logId) : []

    try {
      await mutate(
        cacheKey,
        async () => {
          await deleteComment(token, commentId)
          return await fetcher(cacheKey)
        },
        {
          optimisticData: { data: optimisticData },
          rollbackOnError: true,
          revalidate: true,
        },
      )
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const renderableActivities = useMemo(() => {
    if (!activities?.data || !initialDataLoaded) return []

    // For the initial render, return activities without animation wrapper
    if (previousActivitiesRef.current.length === 0) {
      return activities.data.map((item: LogResponse) => (
        <Box
          key={item.id}
          sx={{
            height: 'auto',
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
            <ActivityLog log={item} />
          )}
        </Box>
      ))
    }

    // For subsequent updates, wrap in TransitionGroup and Collapse
    return (
      <TransitionGroup>
        {activities.data.map((item: LogResponse) => (
          <Collapse key={item.id}>
            <Box
              sx={{
                height: 'auto',
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
                <ActivityLog log={item} />
              )}
            </Box>
          </Collapse>
        ))}
      </TransitionGroup>
    )
  }, [activities?.data, initialDataLoaded])

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
            {renderableActivities}
            <CommentInput createComment={handleCreateComment} task_id={task_id} />
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
