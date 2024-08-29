'use client'

import { selectTaskDetails, setShowSidebar } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'
import { Box, useMediaQuery } from '@mui/material'
import { ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'

export const ToggleController = ({ children }: { children: ReactNode }) => {
  const { showSidebar } = useSelector(selectTaskDetails)
  const matches = useMediaQuery('(max-width:700px)')

  const nonMobile = useMediaQuery('(min-width:700px)')

  useEffect(() => {
    if (nonMobile) {
      store.dispatch(setShowSidebar(true))
    }
  }, [nonMobile])

  return (
    <Box
      sx={{
        maxWidth: showSidebar ? 'calc(100% - 339px)' : '100%',
        display: matches && showSidebar ? 'none' : 'flex',
        flex: 1,
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  )
}
