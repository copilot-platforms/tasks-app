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

export const ActivityWrapper = ({ token, task_id }: { token: string; task_id: string }) => {
  const { data: activities, isLoading } = useSWR(`/api/tasks/${task_id}/activity-logs/?token=${token}`, fetcher, {
    refreshInterval: 1000,
  })

  return (
    <Box width="100%">
      <Stack direction="column" alignItems="left" p="10px 5px" rowGap={5}>
        <Typography variant="xl">Activity</Typography>
        {isLoading ? (
          <Stack direction="column" rowGap={5}>
            <Skeleton variant="rectangular" width={'100%'} height={15} />
            <Skeleton variant="rectangular" width={'100%'} height={15} />
            <Skeleton variant="rectangular" width={'100%'} height={15} />
          </Stack>
        ) : (
          <Stack direction="column" alignItems="left" p="0px 5px" rowGap={4}>
            {activities?.data?.map((item: LogResponse, index: number) => {
              return (
                <Box
                  sx={{
                    height: 'auto',
                    //added for M3 purpose only. This check can be removed later to render all ActivityType
                    display:
                      item.type === ActivityType.TASK_CREATED || item.type === ActivityType.COMMENT_ADDED ? 'block' : 'none',
                  }}
                  key={item.id}
                >
                  {item.type == ActivityType.COMMENT_ADDED ? (
                    <Comments
                      comment={item}
                      createComment={async (postCommentPayload: CreateComment) => {
                        await postComment(token, postCommentPayload)
                      }}
                      deleteComment={async (id: string) => {
                        await deleteComment(token, id)
                      }}
                      task_id={task_id}
                    />
                  ) : (
                    item.type === ActivityType.TASK_CREATED && <ActivityLog log={item} />
                  )}
                </Box>
              )
            })}

            <CommentInput
              createComment={async (postCommentPayload: CreateComment) => {
                await postComment(token, postCommentPayload)
              }}
              task_id={task_id}
            />
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
