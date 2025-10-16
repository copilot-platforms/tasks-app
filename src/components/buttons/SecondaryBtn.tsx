'use client'

import { applySx } from '@/utils/mui'
import { Button, SxProps, Theme } from '@mui/material'
import { ReactNode } from 'react'

export type SecondaryBtnVariant = 'breadcrumb'

export const SecondaryBtn = ({
  startIcon,
  buttonContent,
  handleClick,
  enableBackground,
  outlined,
  padding,
  variant,
  height,
  width,
  sx,
}: {
  startIcon?: ReactNode
  buttonContent: ReactNode
  handleClick?: (() => void) | ((e: React.MouseEvent) => void)
  enableBackground?: boolean
  outlined?: boolean
  padding?: string
  variant?: SecondaryBtnVariant
  height?: string
  width?: string
  sx?: SxProps<Theme>
}) => {
  const variantStyles: {
    [key in SecondaryBtnVariant]: { padding: string; border: string; bgcolor: string; hoverBgcolor: string }
  } = {
    breadcrumb: {
      padding: '2px 4px',
      border: 'none',
      bgcolor: 'white',
      hoverBgcolor: '#F1F3F8',
    },
  }
  const variantStyling = variant ? variantStyles[variant] : undefined

  return (
    <Button
      variant="outlined"
      startIcon={startIcon ? startIcon : null}
      sx={[
        (theme) => ({
          textTransform: 'none',
          border:
            enableBackground || outlined ? 'none' : (variantStyling?.border ?? `1px solid ${theme.color.borders.border}`),
          bgcolor: enableBackground ? theme.color.gray[150] : (variantStyling?.bgcolor ?? ''),
          '&:hover': {
            border:
              enableBackground || outlined ? 'none' : (variantStyling?.border ?? `1px solid ${theme.color.borders.border}`),
          },
          padding: padding ? padding : (variantStyling?.padding ?? { xs: '2px 9px', md: '4px 16px' }),
          cursor: 'pointer',
          height: height ?? 'auto',
          width: width ?? 'auto',
          minWidth: width ? 'auto' : '64px',
        }),
        ...applySx(sx),
      ]}
      onClick={handleClick}
      disableRipple
      disableTouchRipple
    >
      {buttonContent}
    </Button>
  )
}
