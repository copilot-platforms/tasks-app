'use client'

import { useMediaQuery } from '@mui/material'
import { ReactNode } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'

export const DndWrapper = ({ children }: { children: ReactNode }) => {
  const matches = useMediaQuery('(max-width:600px)')

  const options = {
    scrollAngleRanges: [{ start: 300 }, { end: 60 }, { start: 120, end: 240 }],
  }

  return (
    <DndProvider backend={matches ? TouchBackend : HTML5Backend} options={options}>
      {children}
    </DndProvider>
  )
}
