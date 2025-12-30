import { Tooltip } from '@mui/material'
import { ReactElement } from 'react'

interface TooltipProps {
  title: string
  children: ReactElement<any>
}

const TooltipComponent = ({ title, children }: TooltipProps) => {
  return (
    <Tooltip
      title={title}
      slotProps={{
        tooltip: {
          sx: {
            fontWeight: 500,
            fontSize: '12px',
            color: 'rgb(107, 111, 118)',
            backgroundColor: 'white',
          },
        },
      }}
    >
      {children}
    </Tooltip>
  )
}

export { TooltipComponent as Tooltip }
