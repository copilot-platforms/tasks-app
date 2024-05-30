'use client'

import { Avatar, Box, Stack, Typography } from '@mui/material'
import { SecondaryBtn } from '../buttons/SecondaryBtn'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { Tapwrite } from 'tapwrite'
import { Task } from '@mui/icons-material'

export const ClientTaskCard = ({
  task,
  handleMarkDone,
  handleRouteChange,
  markdoneFlag,
}: {
  task: TaskResponse
  handleMarkDone: () => void
  handleRouteChange: () => void
  markdoneFlag: boolean
}) => {
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
          <Stack sx={{ width: '100%', cursor: 'pointer' }} direction="column" onClick={() => handleRouteChange()}>
            <Typography variant="sm">{task?.title}</Typography>
            <Tapwrite content={task?.body || ''} getContent={() => {}} readonly />
          </Stack>
          <Stack direction="row" alignItems="center" minWidth="fit-content" columnGap="20px">
            <Box minWidth="fit-content">
              <Typography variant="bodySm">Apr 05, 2024</Typography>
            </Box>

            <Stack direction="row" alignItems="center" minWidth="90px">
              <Avatar
                src={currentAssignee?.iconImageUrl || currentAssignee?.avatarImageUrl}
                sx={{ width: '20px', height: '20px' }}
              />

              <Typography variant="bodySm" lineHeight="16px" sx={{ color: (theme) => theme.color.gray[600] }}>
                {currentAssignee ? currentAssignee?.givenName || currentAssignee?.name : 'No assignee'}
              </Typography>
            </Stack>
            <Box minWidth="fit-content" ml="12px">
              {!markdoneFlag && (
                <SecondaryBtn
                  handleClick={() => handleMarkDone()}
                  buttonContent={
                    <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[700] }}>
                      Mark done
                    </Typography>
                  }
                />
              )}
            </Box>
          </Stack>
        </Stack>
      </AppMargin>
    </Box>
  )
}
