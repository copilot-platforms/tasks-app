'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { useMediaQuery } from '@mui/material'

export const DndWrapper = ({ children }: { children: ReactNode }) => {
  const [screenType, setScreenType] = useState<'mobile' | 'nonMobile' | undefined>(undefined)

  const isMobileScreen = useMediaQuery('(max-width:600px)')
  useEffect(() => {
    if (isMobileScreen) {
      setScreenType('mobile')
    } else {
      setScreenType('nonMobile')
    }
  }, [isMobileScreen])

  if (!screenType) return null

  return <DndProvider backend={screenType === 'mobile' ? TouchBackend : HTML5Backend}>{children}</DndProvider>
}
