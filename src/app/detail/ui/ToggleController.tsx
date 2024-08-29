'use client'

import { selectTaskDetails, setShowSidebar } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'
import { Box, useMediaQuery } from '@mui/material'
import { ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'

export const ToggleController = ({ children }: { children: ReactNode }) => {
  const { showSidebar } = useSelector(selectTaskDetails)
  const matches = useMediaQuery('(max-width:600px)')

  const nonMobile = useMediaQuery('(min-width:700px)')

  useEffect(() => {
    if (nonMobile) {
      store.dispatch(setShowSidebar(true))
    }
  }, [nonMobile])

  return (
    <Box
      sx={{
        // maxWidth: showSidebar ? { sm: 'calc(100%- 300px)', sd: 'calc(100%- 360px)' } : '100%',
        maxWidth: showSidebar ? { sm: 'calc(100% - 290px)', sd: 'calc(100% - 339px)' } : '100%',
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
