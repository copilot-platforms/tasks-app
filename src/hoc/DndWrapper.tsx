'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { DndProvider, useDragLayer } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { useSelector } from 'react-redux'
import { useMediaQuery } from '@mui/material'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { View } from '@/types/interfaces'

export const DndWrapper = ({ children }: { children: ReactNode }) => {
  const matches = useMediaQuery('(max-width:600px)')
  const { view } = useSelector(selectTaskBoard)

  const listViewModeOptions = {
    scrollAngleRanges: [
      { start: 0, end: 60 },
      { start: 120, end: 180 },
      { start: 240, end: 300 },
    ],
  }

  const boardViewModeOptions = {
    scrollAngleRanges: [
      { start: 30, end: 150 },
      { start: 210, end: 330 },
    ],
  }

  const [backendOptions, setBackendOptions] = useState(listViewModeOptions)

  useEffect(() => {
    setBackendOptions(view === View.BOARD_VIEW ? boardViewModeOptions : listViewModeOptions)
  }, [view])

  if (!view) return null

  return (
    <DndProvider backend={matches ? TouchBackend : HTML5Backend} options={backendOptions}>
      {children}
    </DndProvider>
  )
}
