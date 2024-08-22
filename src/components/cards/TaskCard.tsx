'use client'

import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { IAssigneeCombined } from '@/types/interfaces'
import { NoAssignee } from '@/utils/noAssignee'
import { Box, Skeleton, Stack, Typography, styled } from '@mui/material'
import { useSelector } from 'react-redux'
import { DueDateLayout } from '@/components/layouts/DueDateLayout'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { UrlObject } from 'url'
import { CustomLink } from '@/hoc/CustomLink'
import { useEffect, useState } from 'react'

const TaskCardContainer = styled(Stack)(({ theme }) => ({
  border: `1px solid ${theme.color.borders.border}`,
  borderRadius: theme.spacing(theme.shape.radius100),
  background: theme.color.base.white,
  padding: '12px',
  overflowWrap: 'break-word',
  userSelect: 'none',
  ':hover': {
    background: theme.color.gray[150],
  },
  cursor: 'pointer',
  width: '282px',
}))

interface TaskCardProps {
  task: TaskResponse
  href: string | UrlObject
}

export const TaskCard = ({ task, href }: TaskCardProps) => {
  const { assignee } = useSelector(selectTaskBoard)

  const [currentAssignee, setCurrentAssignee] = useState<IAssigneeCombined | undefined>(undefined)

  useEffect(() => {
    if (assignee.length > 0) {
      const currentAssignee = assignee.find((el) => el.id === task.assigneeId)
      //@ts-expect-error  "type" property has mismatching types in between NoAssignee and IAssigneeCombined
      setCurrentAssignee(currentAssignee ?? NoAssignee)
    }
  }, [assignee])

  return (
    <TaskCardContainer>
      <Stack rowGap={1}>
        <Stack direction="row" justifyContent="space-between">
          {currentAssignee ? (
            <Stack direction="row" alignItems="center" columnGap={1}>
              <CopilotAvatar currentAssignee={currentAssignee as IAssigneeCombined} />
              <Typography
                variant="sm"
                fontSize="12px"
                sx={{
                  color: (theme) => theme.color.gray[500],
                  width: '146px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {(currentAssignee as IAssigneeCombined).name === 'No assignee'
                  ? 'No assignee'
                  : (currentAssignee as IAssigneeCombined)?.name ||
                    `${(currentAssignee as IAssigneeCombined)?.givenName ?? ''} ${(currentAssignee as IAssigneeCombined)?.familyName ?? ''}`.trim()}
              </Typography>
            </Stack>
          ) : (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" columnGap={'4px'}>
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="rectangular" width="146px" height="12px" />
              </Stack>
            </Box>
          )}
          <Typography variant="bodyXs" fontWeight={400} sx={{ color: (theme) => theme.color.gray[500] }}>
            {task.label}
          </Typography>
        </Stack>
        <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[600] }}>
          {task.title}
        </Typography>
        {task.dueDate && <DueDateLayout dateString={task.dueDate} />}
      </Stack>
    </TaskCardContainer>
  )
}
