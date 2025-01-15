'use client'

import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { Stack } from '@mui/material'
import { ReactNode } from 'react'
import { useSelector } from 'react-redux'

export const ResponsiveStack = ({ children }: { children: ReactNode }) => {
  const { showSidebar } = useSelector(selectTaskDetails)

  return (
    <Stack direction={showSidebar ? 'row' : 'column-reverse'} sx={{ height: '100vh' }}>
      {children}
    </Stack>
  )
}
