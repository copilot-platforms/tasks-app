'use client'

import { Avatar, Box, Stack, Typography } from '@mui/material'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'

export const ListViewTaskCard = ({ task }: { task: TaskResponse }) => {
  const { assignee } = useSelector(selectTaskBoard)

  const currentAssignee = assignee.find((el) => el.id === task.assigneeId)

  return (
    <Box
      sx={{
        ':hover': {
          bgcolor: (theme) => theme.color.gray[100],
        },
      }}
    >
      <AppMargin size={SizeofAppMargin.LARGE} py="6px">
        <Stack direction="row" columnGap={8} alignItems="center" justifyContent="space-between">
          <Stack sx={{ width: '100%', cursor: 'pointer' }} direction="row" alignItems="center" columnGap={4}>
            <Typography variant="bodyXs">WEB-01</Typography>
            <Typography variant="bodySm">{task?.title}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" columnGap="20px" minWidth="fit-content">
            <Box minWidth="fit-content">
              <Typography variant="bodySm">Apr 05, 2024</Typography>
            </Box>
            <Stack direction="row" alignItems="center">
              <Avatar
                src={currentAssignee?.iconImageUrl || currentAssignee?.avatarImageUrl}
                sx={{ width: '20px', height: '20px' }}
              />
              <Typography variant="bodySm">{currentAssignee?.givenName || currentAssignee?.name}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </AppMargin>
    </Box>
  )
}
