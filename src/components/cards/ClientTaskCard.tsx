'use client'

import { useSelector } from 'react-redux'
import { Box, Skeleton, Stack, Typography } from '@mui/material'
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
import { GetMaxAssigneeNameWidth } from '@/utils/getMaxAssigneeNameWidth'
import { useEffect, useState } from 'react'
import { StateType } from '@prisma/client'

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
  const [currentAssignee, setCurrentAssignee] = useState<IAssigneeCombined | undefined>(undefined)

  useEffect(() => {
    if (assignee.length > 0) {
      const currentAssignee = assignee.find((el) => el.id === task.assigneeId)
      //@ts-expect-error  "type" property has mismatching types in between NoAssignee and IAssigneeCombined
      setCurrentAssignee(currentAssignee ?? NoAssignee)
    }
  }, [assignee])

  const handleMarkAsDoneClick = (e: React.MouseEvent) => {
    // Since mark as done button is nested inside a `next/link` Link, we need to stop the event from propagating
    // to the behavior of a tag - that would redirect it to the details age
    e.stopPropagation()
    e.preventDefault()
    handleMarkDone()
  }

  return (
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
        alignItems={{ xs: 'left', sm: 'center' }}
        justifyContent="space-between"
        columnGap={{ sm: '20px', md: '32px' }}
        sx={{
          borderBottom: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
          padding: { xs: '8px 20px', sm: '6px 40px 6px 20px' },
        }}
      >
        <CustomLink
          href={href}
          style={{
            flexBasis: '100%',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'left', sm: 'center' }}
            justifyContent="space-between"
            flexBasis="100%"
          >
            <Stack
              direction="column"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'felx',
                wordBreak: 'break-all',
              }}
            >
              <Typography
                variant="sm"
                sx={{ fontSize: '13px', lineHeight: '21px', color: (theme) => theme.color.gray[600] }}
              >
                {task?.title}
              </Typography>

              <Box
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'felx',
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
              rowGap={{ xs: '12px', sm: '32px' }}
              justifyContent={{ xs: 'space-between', sm: 'none' }}
              sx={{
                padding: '6px 0px',
                '@media (max-width: 335px)': {
                  flexWrap: 'wrap',
                  height: 'auto',
                },
              }}
            >
              <Stack direction="row" alignItems="center" minWidth="fit-content" columnGap={{ xs: '12px', sm: '20px' }}>
                {task.dueDate && (
                  <Box
                    sx={{
                      flexDirection: 'row',
                      alignItems: { sm: 'flex-end' },
                      justifyContent: { sm: 'right' },
                      display: { xs: 'flex', sm: 'flex', sd: 'none ' },
                      minWidth: '90px',
                    }}
                  >
                    <Typography variant="bodySm" sx={{ fontSize: '12px', color: (theme) => theme.color.gray[500] }}>
                      <DueDateLayout
                        dateString={task.dueDate}
                        isCompleted={task.workflowState?.type === StateType.completed}
                      />
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: { xs: 'none', sm: 'none', sd: 'flex ' } }}>
                  <Box
                    sx={{
                      flexDirection: 'row',
                      alignItems: { sm: 'flex-end' },
                      justifyContent: { sm: 'right' },
                      display: 'flex',
                      minWidth: '90px',
                    }}
                  >
                    {task.dueDate && (
                      <Typography variant="bodySm" sx={{ fontSize: '12px', color: (theme) => theme.color.gray[500] }}>
                        <DueDateLayout
                          dateString={task.dueDate}
                          isCompleted={task.workflowState?.type === StateType.completed}
                        />
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent={'left'}
                  columnGap={'4px'}
                  sx={{ padding: '2px', width: { xs: 'auto', sm: '132px' } }}
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
                      maxWidth: GetMaxAssigneeNameWidth(task?.dueDate),
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
                  display: { xs: 'flex', md: 'none' },
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
        </CustomLink>
        <Box
          sx={{
            minWidth: '80px',
            display: { xs: 'none', md: 'flex' },
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
    </Box>
  )
}
