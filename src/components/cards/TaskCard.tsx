'use client'

import { TaskResponse } from '@/types/dto/tasks.dto'
import { Avatar, Stack, Typography, styled } from '@mui/material'

const TaskCardContainer = styled(Stack)(({ theme }) => ({
  border: `1px solid ${theme.color.borders.border}`,
  borderRadius: theme.spacing(theme.shape.radius100),
  background: theme.color.base.white,
  padding: '12px',
}))

export const TaskCard = ({ task }: { task: TaskResponse }) => {
  return (
    <TaskCardContainer>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" alignItems="center" columnGap={1}>
          <Avatar alt="user" src="https://avatar.iran.liara.run/public" sx={{ width: '20px', height: '20px' }} />
          <Typography variant="sm">{task.assigneeId}</Typography>
        </Stack>
        <Typography variant="bodyXs">WEB-01</Typography>
      </Stack>
      <Typography variant="sm">{task.title}</Typography>
    </TaskCardContainer>
  )
}
