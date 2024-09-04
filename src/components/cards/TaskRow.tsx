'use client'

import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { Typography, Box, Stack } from '@mui/material'
import { ReactNode } from 'react'
import { AddBtn } from '@/components/buttons/AddBtn'
import { handleAddBtnClicked } from '@/app/ui/TaskBoard.helpers'

interface Prop {
  workflowStateId: string
  children: ReactNode
  columnName: string
  taskCount: string
  display?: boolean
}

export const TaskRow = ({ workflowStateId, children, columnName, taskCount, display = true }: Prop) => {
  return display ? (
    <Box>
      <Box
        sx={{
          background: (theme) => theme.color.gray[100],
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

            <AddBtn handleClick={() => handleAddBtnClicked(workflowStateId)} sx={{ paddingRight: '3px' }} />
          </Stack>
        </AppMargin>
      </Box>
      {children}
    </Box>
  ) : null
}
