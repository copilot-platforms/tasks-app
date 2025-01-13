'use client'
import { ToggleBtn } from '@/components/buttons/ToggleBtn'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { selectTaskDetails, setShowSidebar } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'
import { Box } from '@mui/material'
import { useSelector } from 'react-redux'

export const ToggleButtonContainer = () => {
  const { showSidebar } = useSelector(selectTaskDetails)
  const { previewMode } = useSelector(selectTaskBoard)
  if (!previewMode) {
    return (
      <Box sx={{ width: '72vw', display: 'flex', justifyContent: 'flex-end' }}>
        <ToggleBtn onClick={() => store.dispatch(setShowSidebar(!showSidebar))} />
      </Box>
    )
  }
  return <ToggleBtn onClick={() => store.dispatch(setShowSidebar(!showSidebar))} />
}
