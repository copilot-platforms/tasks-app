'use client'

import { IconButton, Stack, Typography, styled } from '@mui/material'
import { MoreHoriz, Add } from '@mui/icons-material'
import { ReactNode } from 'react'

const TaskColumnHeader = styled(Stack)({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '8px',
})

const TaskColumnContainer = styled(Stack)({
  width: '275px',
  height: '100vh',
})

interface Prop {
  children: ReactNode
  columnName: string
  taskCount: string
}

export const TaskColumn = ({ children, columnName, taskCount }: Prop) => {
  return (
    <TaskColumnContainer>
      <TaskColumnHeader>
        <Stack direction="row" alignItems="center" columnGap={2}>
          <Typography variant="md">{columnName}</Typography>
          <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[400], fontSize: '12px' }}>
            {taskCount}
          </Typography>
        </Stack>
      </TaskColumnHeader>
      {children}
    </TaskColumnContainer>
  )
}
