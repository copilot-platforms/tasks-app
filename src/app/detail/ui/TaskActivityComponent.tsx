'use client'

import { Box, Stack, Typography } from '@mui/material'
import { ActivityLog } from './ActivityLog'
import { Comments } from './Comments'
import { StyledTextField } from '@/components/inputs/TextField'
import { CommentInput } from '@/components/inputs/CommentInput'

interface Prop {
  activities: any
}

export const TaskActivityComponent = ({ activities }: Prop) => {
  return (
    <>
      <Stack direction="column" alignItems="left" p="10px 5px" rowGap={5}>
        <Typography variant="xl">Activity</Typography>
        <Stack direction="column" alignItems="left" p="10px 5px" rowGap={4}>
          {activities.map((item: any, index: number) => {
            return (
              <Box
                sx={{
                  height: 'auto',
                  display: 'block',
                }}
                key={item.id}
              >
                {item.activityType ? (
                  <ActivityLog log={item} isLast={index == activities.length - 1} />
                ) : (
                  <Comments comment={item} />
                )}
              </Box>
            )
          })}

          <CommentInput />
        </Stack>
      </Stack>
    </>
  )
}
