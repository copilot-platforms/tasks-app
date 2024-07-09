'use client'

import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { IAssigneeCombined } from '@/types/interfaces'
import { NoAssignee } from '@/utils/noAssignee'
import { Avatar, Stack, Typography, styled } from '@mui/material'
import { useSelector } from 'react-redux'
import { DueDateLayout } from '@/components/layouts/DueDateLayout'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { UrlObject } from 'url'
import { StyledUninvasiveLink } from '@/app/detail/ui/styledComponent'

const TaskCardContainer = styled(Stack)(({ theme }) => ({
  border: `1px solid ${theme.color.borders.border}`,
  borderRadius: theme.spacing(theme.shape.radius100),
  background: theme.color.base.white,
  padding: '12px',
  userSelect: 'none',
  ':hover': {
    background: theme.color.gray[150],
  },
  cursor: 'pointer',
}))

interface TaskCardProps {
  task: TaskResponse
  href: string | UrlObject
}

export const TaskCard = ({ task, href }: TaskCardProps) => {
  const { assignee } = useSelector(selectTaskBoard)

  const currentAssignee = assignee.find((el) => el.id === task.assigneeId) ?? NoAssignee

  return (
    <StyledUninvasiveLink href={href} prefetch={true}>
      <TaskCardContainer rowGap={1}>
        <Stack direction="row" justifyContent="space-between">
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
          <Typography variant="bodyXs" fontWeight={400} sx={{ color: (theme) => theme.color.gray[500] }}>
            {task.label}
          </Typography>
        </Stack>
        <Typography variant="sm">{task.title}</Typography>
        {task.dueDate && <DueDateLayout date={task.dueDate} />}
      </TaskCardContainer>
    </StyledUninvasiveLink>
  )
}
