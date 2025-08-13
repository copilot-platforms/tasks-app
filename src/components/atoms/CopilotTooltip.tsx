import { Tooltip } from 'copilot-design-system'
import React from 'react'

interface CopilotTooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  position?: 'top' | 'bottom' | 'left' | 'right'
  placement?: 'left' | 'right' | 'center'
}

export const CopilotTooltip = ({ content, children, position = 'bottom', placement = 'center' }: CopilotTooltipProps) => {
  return (
    <Tooltip
      content={content}
      position={position}
      tooltipClassname="tooltip"
      offset={{ x: placement == 'right' ? 50 : placement == 'left' ? -50 : 0, y: -10 }}
    >
      {children}
    </Tooltip>
  )
}
