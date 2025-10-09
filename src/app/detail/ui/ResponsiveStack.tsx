'use client'

import { selectTaskDetails, setFromNotificationCenter } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'
import { Stack } from '@mui/material'
import { ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'

export const ResponsiveStack = ({
  children,
  fromNotificationCenter,
}: {
  children: ReactNode
  fromNotificationCenter: boolean
}) => {
  const { showSidebar } = useSelector(selectTaskDetails)

  useEffect(() => {
    store.dispatch(setFromNotificationCenter(fromNotificationCenter))
  }, [fromNotificationCenter])

  return (
    <Stack
      direction={!showSidebar || fromNotificationCenter ? 'column-reverse' : 'row'}
      sx={{
        height: '100vh',
      }}
    >
      {children}
    </Stack>
  )
}
