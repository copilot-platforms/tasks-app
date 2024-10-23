'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'

import { useMediaQuery } from '@mui/material'
import { ModifiedHTML5Backend, ModifiedTouchBackend } from './ModifiedBackend'

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

  return (
    <DndProvider
      backend={screenType === 'mobile' ? ModifiedTouchBackend : ModifiedHTML5Backend}
      options={{
        delayTouchStart: 100,
      }}
    >
      {children}
    </DndProvider>
  )
}
