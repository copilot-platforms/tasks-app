'use client'

import { Button } from '@mui/material'
import { ReactNode } from 'react'

export const SecondaryBtn = ({
  startIcon,
  buttonContent,
  handleClick,
  enableBackground,
  outlined,
  padding,
}: {
  startIcon?: ReactNode
  buttonContent: ReactNode
  handleClick?: (() => void) | ((e: React.MouseEvent) => void)
  enableBackground?: boolean
  outlined?: boolean
  padding?: string
}) => {
  return (
    <Button
      variant="outlined"
      startIcon={startIcon ? startIcon : null}
      sx={(theme) => ({
        textTransform: 'none',
        border: enableBackground || outlined ? 'none' : `1px solid ${theme.color.borders.border}`,
        bgcolor: enableBackground ? theme.color.gray[150] : '',
        '&:hover': {
          border: enableBackground || outlined ? 'none' : `1px solid ${theme.color.borders.border}`,
        },
        padding: padding ? padding : { xs: '2px 9px', md: '4px 16px' },
        cursor: 'pointer',
      })}
      onClick={handleClick}
      disableRipple
      disableTouchRipple
    >
      {buttonContent}
    </Button>
  )
}
