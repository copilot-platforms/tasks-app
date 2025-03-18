'use client'

import { Box, Skeleton, Stack, Typography, alpha } from '@mui/material'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TaskResponse, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { SelectorType } from '@/components/inputs/Selector'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import Selector from '@/components/inputs/Selector'
import { IAssigneeCombined } from '@/types/interfaces'
import { NoAssignee, NoAssigneeExtraOptions } from '@/utils/noAssignee'
import ExtraOptionRendererAssignee from '@/components/inputs/ExtraOptionRendererAssignee'
import { DueDateLayout } from '@/components/layouts/DueDateLayout'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { UrlObject } from 'url'
import { CustomLink } from '@/hoc/CustomLink'
import { getAssigneeName } from '@/utils/assignee'
import { AssigneeType } from '@prisma/client'
import { useEffect, useState } from 'react'
import { ArchiveBoxIcon } from '@/icons'
import { isTaskCompleted } from '@/utils/isTaskCompleted'
import { useWindowWidth } from '@/hooks/useWindowWidth'

export const ListViewTaskCard = ({
  task,
  updateTask,
  href,
}: {
  task: TaskResponse
  updateTask?: ({ payload }: { payload: UpdateTaskRequest }) => void
  href: string | UrlObject
}) => {
  const { assignee, workflowStates } = useSelector(selectTaskBoard)

  const [currentAssignee, setCurrentAssignee] = useState<IAssigneeCombined | undefined>(undefined)

  useEffect(() => {
    if (assignee.length > 0) {
      const currentAssignee = assignee.find((el) => el.id === task.assigneeId)
      //@ts-expect-error  "type" property has mismatching types in between NoAssignee and IAssigneeCombined
      setCurrentAssignee(currentAssignee ?? NoAssignee)
    }
  }, [assignee, task])

  const windowWidth = useWindowWidth()
  const isDesktop = windowWidth > 960 && windowWidth !== 0

  return (
    <Box
      className="task-list-card"
      sx={{
        maxWidth: '100vw',
        userSelect: 'none',
        cursor: 'pointer',
        borderBottom: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
        ':hover': {
          bgcolor: (theme) => alpha(theme.color.gray[100], 0.5),
        },
      }}
    >
      <Box sx={{ padding: '8.5px 20px' }}>
        <Stack direction="row" sx={{ gap: { xs: '10px', sm: '20px' } }} alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" sx={{ gap: { xs: '8px', sm: '16px' } }}>
            <Typography
              variant="sm"
              fontWeight={400}
              sx={{
                color: (theme) => theme.color.gray[500],
                flexGrow: 0,
                maxWidth: {
                  xs: '60px',
                  sm: '100%',
                },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: '21px',
              }}
            >
              {task.label}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              <Stack direction={'row'} alignItems="center" columnGap={'8px'}>
                <Typography
                  variant="sm"
                  sx={{
                    lineHeight: '21px',
                    wordBreak: 'break-word',
                    flexGrow: 1,
                    maxWidth: { xs: `calc(100vw - 225px)`, sm: `calc(100vw - 350px)`, md: `calc(100vw - 400px)` },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {task?.title}
                </Typography>
                {task.isArchived && (
                  <Box title="Archived">
                    <ArchiveBoxIcon />
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" sx={{ gap: { xs: '10px', sm: '20px' } }}>
            <Box
              sx={{
                display: 'block',
                maxWidth: {
                  xs: '66px',
                  sm: '100%',
                },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {task.dueDate && <DueDateLayout dateString={task.dueDate} isDone={isTaskCompleted(task, workflowStates)} />}
            </Box>

            {currentAssignee ? (
              <Stack
                direction="row"
                alignItems="center"
                columnGap="7px"
                justifyContent="flex-start"
                sx={{
                  padding: '8px',
                }}
              >
                <CopilotAvatar currentAssignee={currentAssignee as IAssigneeCombined} />
                {isDesktop && (
                  <Typography
                    variant="bodySm"
                    fontSize="12px"
                    sx={{
                      color: (theme) => theme.color.gray[500],
                      width: '110px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getAssigneeName(currentAssignee)}
                  </Typography>
                )}
              </Stack>
            ) : (
              <Stack
                direction="row"
                alignItems="center"
                columnGap="7px"
                justifyContent="flex-start"
                sx={{
                  padding: '8px',
                }}
              >
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="rectangular" width="100px" height="12px" />
              </Stack>
            )}
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}
