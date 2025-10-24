import { useMediaQuery } from '@mui/material'
import { Tooltip } from 'copilot-design-system'
import React, { useRef, useState } from 'react'

export interface CopilotTooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  position?: 'top' | 'bottom' | 'left' | 'right'
  disabled?: boolean
  allowMaxWidth?: boolean
}

export const CopilotTooltip = ({
  content,
  children,
  position = 'bottom',
  disabled = false,
  allowMaxWidth = false,
}: CopilotTooltipProps) => {
  const [open, setOpen] = useState(false)
  const timer = useRef<NodeJS.Timeout | null>(null)
  const isMobileScreen = useMediaQuery('(max-width:600px)')
  const [dynamicPlacement, setDynamicPlacement] = useState<'left' | 'right' | 'center'>('center')

  const handlePosition = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    const tooltipWidth = 100
    const viewportWidth = window.innerWidth

    if (rect.right + tooltipWidth > viewportWidth) {
      setDynamicPlacement('left')
    } else if (rect.left - tooltipWidth < 0) {
      setDynamicPlacement('right')
    } else {
      setDynamicPlacement('center')
    }
  }

  return (
    <Tooltip
      content={content}
      position={position}
      tooltipClassname={open ? `tooltip${allowMaxWidth ? ' tooltip-max z-69420' : ''}` : 'displayoff'}
      offset={{ x: dynamicPlacement == 'right' ? 40 : dynamicPlacement == 'left' ? -55 : 7, y: -5 }}
      disabled={disabled || isMobileScreen}
    >
      <span
        style={{
          display: 'flex',
        }}
        onMouseEnter={(e) => {
          handlePosition(e.currentTarget)
          timer.current = setTimeout(() => setOpen(true), 500)
        }}
        onMouseLeave={() => {
          if (timer.current) clearTimeout(timer.current)
          setOpen(false)
        }}
        onMouseDown={() => {
          if (timer.current) clearTimeout(timer.current)
          setOpen(false)
        }}
      >
        {children}
      </span>
    </Tooltip>
  )
}
