'use client'

import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { NoAssignee } from '@/utils/noAssignee'
import { Avatar, Stack, Typography, styled } from '@mui/material'
import { useSelector } from 'react-redux'

const TaskCardContainer = styled(Stack)(({ theme }) => ({
  border: `1px solid ${theme.color.borders.border}`,
  borderRadius: theme.spacing(theme.shape.radius100),
  background: theme.color.base.white,
  padding: '12px',
}))

export const TaskCard = ({ task }: { task: TaskResponse }) => {
  const { assignee } = useSelector(selectTaskBoard)

  const currentAssignee = assignee.find((el) => el.id === task.assigneeId) ?? NoAssignee
  console.log(currentAssignee)
  return (
    <TaskCardContainer>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" alignItems="center" columnGap={1}>
          <Avatar
            alt={currentAssignee?.givenName == 'No assignee' ? '' : currentAssignee?.givenName}
            src={currentAssignee?.iconImageUrl || currentAssignee?.avatarImageUrl || 'user'}
            sx={{ width: '20px', height: '20px' }}
            variant={currentAssignee?.type === 'companies' ? 'rounded' : 'circular'}
          />
          <Typography variant="sm">{currentAssignee?.givenName || currentAssignee?.name}</Typography>
        </Stack>
        <Typography variant="bodyXs">{task.label}</Typography>
      </Stack>
      <Typography variant="sm">{task.title}</Typography>
    </TaskCardContainer>
  )
}
