'use client'

import { Avatar, Box, Stack, Typography } from '@mui/material'
import { SecondaryBtn } from '../buttons/SecondaryBtn'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { DueDateLayout } from '@/components/utils/DueDateLayout'
import { extractHtml } from '@/utils/extractHtml'
import { truncateText } from '@/utils/truncateText'
import { TruncateMaxNumber } from '@/types/interfaces'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'

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
      <AppMargin size={SizeofAppMargin.LARGE} py="2px">
        <Stack direction="row" columnGap={8} alignItems="center" justifyContent="space-between">
          <Stack sx={{ width: '100%', cursor: 'pointer' }} direction="column" onClick={() => handleRouteChange()}>
            <Typography variant="sm">{task?.title}</Typography>
            <Box
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <Typography variant="bodySm">
                {truncateText(extractHtml(task.body ?? ''), TruncateMaxNumber.CLIENT_TASK_DESCRIPTION)}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" minWidth="fit-content" columnGap="20px">
            <Box minWidth="fit-content">
              {task.dueDate && (
                <Typography variant="bodySm">
                  <DueDateLayout date={task.dueDate} />
                </Typography>
              )}
            </Box>
            <Stack direction="row" alignItems="flex-start" minWidth="250px" columnGap={2}>
              <Stack direction="row" alignItems="flex-start" minWidth="90px" columnGap={2}>
                <Avatar
                  src={currentAssignee?.iconImageUrl ?? currentAssignee?.avatarImageUrl}
                  sx={{ width: '20px', height: '20px' }}
                  variant={currentAssignee?.type === 'companies' ? 'rounded' : 'circular'}
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
        </Stack>
      </AppMargin>
    </Box>
  )
}
