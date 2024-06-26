'use client'

import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { IAssigneeCombined } from '@/types/interfaces'
import { NoAssignee } from '@/utils/noAssignee'
import { Avatar, Stack, Typography, styled } from '@mui/material'
import { useSelector } from 'react-redux'
import { DueDateLayout } from '@/components/utils/DueDateLayout'

const TaskCardContainer = styled(Stack)(({ theme }) => ({
  border: `1px solid ${theme.color.borders.border}`,
  borderRadius: theme.spacing(theme.shape.radius100),
  background: theme.color.base.white,
  padding: '12px',
  ':hover': {
    background: theme.color.gray[150],
  },
}))

export const TaskCard = ({ task }: { task: TaskResponse }) => {
  const { assignee } = useSelector(selectTaskBoard)

  const currentAssignee = assignee.find((el) => el.id === task.assigneeId) ?? NoAssignee

  return (
    <TaskCardContainer rowGap={1}>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" alignItems="center" columnGap={1}>
          <Avatar
            alt={currentAssignee?.givenName == 'No assignee' ? '' : currentAssignee?.givenName}
            src={currentAssignee?.iconImageUrl || currentAssignee?.avatarImageUrl || 'user'}
            sx={{ width: '20px', height: '20px' }}
            variant={(currentAssignee as IAssigneeCombined)?.type === 'companies' ? 'rounded' : 'circular'}
          />
          <Typography variant="sm" fontSize="12px" sx={{ color: (theme) => theme.color.gray[500] }}>
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
  )
}
