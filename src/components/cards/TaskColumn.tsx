'use client'

import { Box, Stack, Typography, styled } from '@mui/material'
import { UserRole } from '@/app/api/core/types/user'
import { handleAddBtnClicked } from '@/app/ui/TaskBoard.helpers'
import { AddBtn } from '@/components/buttons/AddBtn'
import { TaskWorkflowStateProps } from '@/types/taskBoard'

const TaskColumnHeader = styled(Stack)({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '8px',
  width: '304px',
})

const TaskColumnContainer = styled(Stack)({
  width: '306px',
  height: 'calc(100vh - 195px)',
  marginTop: '6px',
  justifyContent: 'space-between',
  alignItems: 'center',
})

interface TaskColumnProps extends TaskWorkflowStateProps {}

export const TaskColumn = ({ workflowStateId, mode, children, columnName, taskCount }: TaskColumnProps) => {
  return (
    <>
      <TaskColumnHeader>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Stack direction="row" alignItems="center" columnGap={2}>
            <Typography variant="md">{columnName}</Typography>
            <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[400], fontSize: '12px' }}>
              {taskCount}
            </Typography>
          </Stack>

          {/* ((22 - 16) / 2) + 10 */}
          {mode === UserRole.IU && <AddBtn handleClick={() => handleAddBtnClicked(workflowStateId)} />}
          {/* (22 - 16) / 2 */}
        </Box>
      </TaskColumnHeader>
      <TaskColumnContainer>{children}</TaskColumnContainer>
    </>
  )
}
