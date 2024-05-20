'use client'

import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { Box, useMediaQuery } from '@mui/material'
import { ReactNode } from 'react'
import { useSelector } from 'react-redux'

export const ToggleController = ({ children }: { children: ReactNode }) => {
  const { showSidebar } = useSelector(selectTaskDetails)
  const matches = useMediaQuery('(max-width:600px)')

  return (
    <Box
      sx={{
        width: showSidebar ? 'calc(100% - 339px)' : '100%',
        display: matches && showSidebar ? 'none' : 'block',
      }}
    >
      {children}
    </Box>
  )
}
