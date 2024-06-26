'use client'

import React, { ReactNode } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { useMediaQuery } from '@mui/material'

export const DndWrapper = ({ children }: { children: ReactNode }) => {
  const matches = useMediaQuery('(max-width:600px)')

  return <DndProvider backend={matches ? TouchBackend : HTML5Backend}>{children}</DndProvider>
}
