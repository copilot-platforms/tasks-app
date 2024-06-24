'use client'

import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { NoAssignee } from '@/utils/noAssignee'
import { Avatar, Stack, Typography, styled } from '@mui/material'
import { useSelector } from 'react-redux'
import { DueDateLayout } from '@/components/utils/DueDateLayout'

const TaskCardContainer = styled(Stack)(({ theme }) => ({
  border: `1px solid ${theme.color.borders.border}`,
  borderRadius: theme.spacing(theme.shape.radius100),
  background: theme.color.base.white,
  padding: '12px',
}))

export const TaskCard = ({ task }: { task: TaskResponse }) => {
  const { assignee } = useSelector(selectTaskBoard)

  const currentAssignee = assignee.find((el) => el.id === task.assigneeId) ?? NoAssignee
  return (
    <TaskCardContainer rowGap={1}>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" alignItems="center" columnGap={1}>
          <Avatar
            alt="user"
            src={currentAssignee?.iconImageUrl || currentAssignee?.avatarImageUrl}
            sx={{ width: '20px', height: '20px' }}
            variant={currentAssignee?.type === 'companies' ? 'rounded' : 'circular'}
          />
          <Typography
            variant="bodySm"
            sx={{ fontWeight: (theme) => theme.typography.lg.fontWeight, color: (theme) => theme.color.gray[500] }}
          >
            {currentAssignee?.givenName || currentAssignee?.name}
          </Typography>
        </Stack>
        <Typography
          variant="bodyXs"
          sx={{ fontWeight: (theme) => theme.typography.bodyXs, color: (theme) => theme.color.gray[500] }}
        >
          WEB-01
        </Typography>
      </Stack>
      <Typography variant="sm">{task.title}</Typography>
      {task.dueDate && <DueDateLayout date={task.dueDate} />}
    </TaskCardContainer>
  )
}
