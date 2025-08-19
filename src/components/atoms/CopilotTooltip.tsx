import { Tooltip } from 'copilot-design-system'
import React, { useRef, useState } from 'react'

export interface CopilotTooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  position?: 'top' | 'bottom' | 'left' | 'right'
  placement?: 'left' | 'right' | 'center'
  disabled?: boolean
}

export const CopilotTooltip = ({
  content,
  children,
  position = 'bottom',
  placement = 'center',
  disabled = false,
}: CopilotTooltipProps) => {
  const [open, setOpen] = useState(false)
  const timer = useRef<NodeJS.Timeout | null>(null)

  return (
    <Tooltip
      content={content}
      position={position}
      tooltipClassname={open ? 'tooltip' : 'displayoff'}
      offset={{ x: placement == 'right' ? 50 : placement == 'left' ? -50 : 5, y: -10 }}
      disabled={disabled}
    >
      <span
        onMouseEnter={() => {
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
