'use client'

import { Button } from '@mui/material'
import { ReactNode } from 'react'

export const SecondaryBtn = ({
  startIcon,
  buttonContent,
  handleClick,
  enableBackground,
}: {
  startIcon?: ReactNode | undefined
  buttonContent: ReactNode
  handleClick?: () => void
  enableBackground?: boolean
}) => {
  return (
    <Button
      variant="outlined"
      startIcon={startIcon ? startIcon : null}
      sx={(theme) => ({
        textTransform: 'none',
        border: enableBackground ? 'none' : `1px solid ${theme.color.borders.border}`,
        bgcolor: enableBackground ? theme.color.gray[150] : '',
        '&:hover': {
          border: enableBackground ? 'none' : `1px solid ${theme.color.borders.border}`,
          bgcolor: theme.color.gray[150],
        },
        '.MuiTouchRipple-child': {
          bgcolor: theme.color.borders.border,
        },
      })}
      onClick={handleClick}
    >
      {buttonContent}
    </Button>
  )
}
