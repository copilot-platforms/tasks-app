'use client'

import { useSelector } from 'react-redux'
import { Box, Stack, Typography } from '@mui/material'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { extractHtml } from '@/utils/extractHtml'
import { truncateText } from '@/utils/truncateText'
import { TruncateMaxNumber } from '@/types/constants'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { IAssigneeCombined } from '@/types/interfaces'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { DueDateLayout } from '@/components/layouts/DueDateLayout'
import { UrlObject } from 'url'
import { CustomLink } from '@/hoc/CustomLink'
import { getAssigneeName } from '@/utils/assignee'

export const ClientTaskCard = ({
  task,
  handleMarkDone,
  markdoneFlag,
  href,
}: {
  task: TaskResponse
  handleMarkDone: () => void
  markdoneFlag: boolean
  href: string | UrlObject
}) => {
  const { assignee } = useSelector(selectTaskBoard)
  const currentAssignee = assignee.find((el) => el.id === task.assigneeId)

  const handleMarkAsDoneClick = (e: React.MouseEvent) => {
    // Since mark as done button is nested inside a `next/link` Link, we need to stop the event from propagating
    // to the behavior of a tag - that would redirect it to the details age
    e.stopPropagation()
    e.preventDefault()
    handleMarkDone()
  }

  return (
    <CustomLink href={href}>
      <Box
        sx={{
          ':hover': {
            bgcolor: (theme) => theme.color.gray[100],
          },
          cursor: 'default',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="flex-start"
          justifyContent="space-between"
          sx={{
            borderBottom: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
            padding: { xs: '2px 20px', sm: '2px 36px' },
          }}
        >
          <Stack direction="column">
            <Typography variant="sm" sx={{ fontSize: '13px' }}>
              {task?.title}
            </Typography>
            <Box
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <Typography variant="bodySm" sx={{ fontSize: '12px', color: (theme) => theme.color.gray[500] }}>
                {truncateText(extractHtml(task.body ?? ''), TruncateMaxNumber.CLIENT_TASK_DESCRIPTION)}
              </Typography>
            </Box>
          </Stack>
          <Stack
            direction="row"
            alignItems="flex-start"
            columnGap={{ xs: '12px', sm: '32px' }}
            justifyContent={{ xs: 'space-between', sm: 'none' }}
            sx={{
              padding: '6px 0px',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Stack direction="row" alignItems="center" minWidth="fit-content" columnGap={{ xs: '12px', sm: '20px' }}>
              <Box
                sx={{
                  flexDirection: 'row',
                  alignItems: { sm: 'flex-end' },
                  justifyContent: { sm: 'right' },
                  display: 'flex',
                  minWidth: '100px',
                }}
              >
                {task.dueDate && (
                  <Typography variant="bodySm" sx={{ fontSize: '12px', color: (theme) => theme.color.gray[500] }}>
                    <DueDateLayout dateString={task.dueDate} />
                  </Typography>
                )}
              </Box>

              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent={'left'}
                columnGap={1}
                sx={{ padding: '2px', minWidth: '132px', maxWidth: '200px' }}
              >
                <CopilotAvatar currentAssignee={currentAssignee as IAssigneeCombined} />

                <Typography
                  variant="bodySm"
                  sx={{
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    fontSize: '12px',
                    color: (theme) => theme.color.gray[500],
                  }}
                  title={getAssigneeName(currentAssignee)}
                >
                  {getAssigneeName(currentAssignee)}
                </Typography>
              </Stack>
            </Stack>
            <Box
              sx={{
                minWidth: '80px',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              {!markdoneFlag && (
                <SecondaryBtn
                  handleClick={handleMarkAsDoneClick}
                  padding="2px 8px"
                  buttonContent={
                    <Typography
                      variant="sm"
                      sx={{
                        color: (theme) => theme.color.gray[700],
                        zIndex: '99',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}
                    >
                      Mark done
                    </Typography>
                  }
                />
              )}
            </Box>
          </Stack>
        </Stack>
      </Box>
    </CustomLink>
  )
}
