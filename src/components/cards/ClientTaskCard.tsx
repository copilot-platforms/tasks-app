'use client'

import { Avatar, Box, Stack, Typography } from '@mui/material'
import { SecondaryBtn } from '../buttons/SecondaryBtn'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { DueDateLayout } from '@/components/utils/DueDateLayout'
import { extractHtml } from '@/utils/extractHtml'
import { truncateText } from '@/utils/truncateText'
import { IAssigneeCombined } from '@/types/interfaces'
import { TruncateMaxNumber } from '@/types/constants'

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
        <Stack direction={{ xs: 'column', sm: 'row' }} rowGap={2} alignItems="flex-start" justifyContent="space-between">
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
          <Stack direction="row" alignItems="flex-start" minWidth="fit-content" columnGap={4} justifyContent="space-between">
            <Stack
              direction="row"
              alignItems="flex-end"
              minWidth="200px"
              columnGap={{ xs: 1, sm: 3 }}
              sx={{ padding: '2px' }}
            >
              <Box
                minWidth={{ xs: '90px' }}
                sx={{
                  flexDirection: 'row',
                  alignItems: { sm: 'flex-end' },
                  justifyContent: { sm: 'right' },
                  display: 'flex',
                }}
              >
                {task.dueDate && (
                  <Typography variant="bodySm">
                    <DueDateLayout date={task.dueDate} />
                  </Typography>
                )}
              </Box>
              <Stack direction="row" alignItems="flex-start" columnGap={1} sx={{ padding: '2px' }}>
                <Avatar
                  src={currentAssignee?.iconImageUrl || currentAssignee?.avatarImageUrl || 'user'}
                  alt={currentAssignee?.givenName || currentAssignee?.familyName || currentAssignee?.name}
                  sx={{ width: '20px', height: '20px' }}
                  variant={currentAssignee?.type === 'companies' ? 'rounded' : 'circular'}
                />

                <Typography
                  variant="bodySm"
                  sx={{
                    color: (theme) => theme.color.gray[600],
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {truncateText(
                    (currentAssignee as IAssigneeCombined)?.name ||
                      `${(currentAssignee as IAssigneeCombined)?.givenName ?? ''} ${(currentAssignee as IAssigneeCombined)?.familyName ?? ''}`.trim() ||
                      'No Assignee',
                    TruncateMaxNumber.SELECTOR,
                  )}
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" alignItems="flex-start" minWidth={'120px'} columnGap={2} ml="12px">
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
