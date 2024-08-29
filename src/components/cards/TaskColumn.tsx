'use client'

import { GrayAddIcon } from '@/icons'
import { Box, Stack, Typography, styled } from '@mui/material'
import { ReactNode } from 'react'
import store from '@/redux/store'
import { setActiveWorkflowStateId, setShowModal } from '@/redux/features/createTaskSlice'

const TaskColumnHeader = styled(Stack)({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '8px',
})

const TaskColumnContainer = styled(Stack)({
  width: '292px',
  margin: '0 auto',
  height: 'calc(100vh - 195px)',
  marginTop: '6px',
})

interface Prop {
  workflowStateId: string
  children: ReactNode
  columnName: string
  taskCount: string
}

export const TaskColumn = ({ workflowStateId, children, columnName, taskCount }: Prop) => {
  const handleAddBtnClicked = () => {
    store.dispatch(setActiveWorkflowStateId(workflowStateId))
    store.dispatch(setShowModal())
  }
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

          {/* (22 - 16) / 2 */}
          <Box sx={{ paddingRight: '13px', ':hover': { cursor: 'pointer' } }}>
            <GrayAddIcon onClick={handleAddBtnClicked} />
          </Box>
        </Box>
      </TaskColumnHeader>
      <TaskColumnContainer>{children}</TaskColumnContainer>
    </>
  )
}
