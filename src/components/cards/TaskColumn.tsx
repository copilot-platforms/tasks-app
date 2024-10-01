'use client'

import { Stack, Typography, styled } from '@mui/material'
import { ReactNode } from 'react'

const TaskColumnHeader = styled(Stack)({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '8px',
})

const TaskColumnContainer = styled(Stack)({
  width: '292px',
  margin: '0 auto',
  marginTop: '6px',
})

interface Prop {
  children: ReactNode
  columnName: string
  taskCount: string
}

export const TaskColumn = ({ children, columnName, taskCount }: Prop) => {
  return (
    <>
      <TaskColumnHeader>
        <Stack direction="row" alignItems="center" columnGap={2}>
          <Typography variant="md">{columnName}</Typography>
          <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[400], fontSize: '12px' }}>
            {taskCount}
          </Typography>
        </Stack>
      </TaskColumnHeader>
      <TaskColumnContainer
        sx={{
          height: { xs: 'calc(100vh - 230px)', md: 'calc(100vh - 195px)' },
        }}
      >
        {children}
      </TaskColumnContainer>
    </>
  )
}
