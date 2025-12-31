'use client'

import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { Typography, Box, Stack } from '@mui/material'
import { AddBtn } from '@/components/buttons/AddBtn'
import { handleAddBtnClicked } from '@/app/ui/TaskBoard.helpers'
import { TaskWorkflowStateProps } from '@/types/taskBoard'
import { StateType } from '@prisma/client'
import { WorkflowStateThemeMap } from '@/types/objectMaps'

interface TaskRowProps extends TaskWorkflowStateProps {
  workflowStateType: StateType
  display?: boolean
  showAddBtn?: boolean
}

export const TaskRow = ({
  workflowStateId,
  workflowStateType,
  mode,
  children,
  columnName,
  taskCount,
  display = true,
  showAddBtn,
}: TaskRowProps) => {
  return display ? (
    <Box>
      <Box
        sx={{
          background: (theme) => theme.color.workflowState[WorkflowStateThemeMap[workflowStateType]],
          borderBottom: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
        }}
      >
        <AppMargin size={SizeofAppMargin.HEADER} py="6px" sx={{ maxWidth: '100vw' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" columnGap={'8px'}>
              <Typography variant="md">{columnName}</Typography>
              <Typography
                variant="sm"
                sx={{
                  color: (theme) => theme.color.gray[400],
                }}
              >
                {taskCount}
              </Typography>
            </Stack>
            {showAddBtn && <AddBtn handleClick={() => handleAddBtnClicked(workflowStateId)} />}
          </Stack>
        </AppMargin>
      </Box>
      {children}
    </Box>
  ) : null
}
