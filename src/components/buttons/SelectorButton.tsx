import { applySx } from '@/utils/mui'
import { Button, SxProps, Theme } from '@mui/material'
import { Property } from 'csstype'
import { ReactNode } from 'react'

export const SelectorButton = ({
  buttonContent,
  startIcon,
  handleClick,
  enableBackground,
  outlined,
  padding,
  disabled,
  height,
  error,
  endIcon,
  cursor,
  sx,
}: {
  startIcon?: ReactNode
  buttonContent: ReactNode
  handleClick?: () => void
  enableBackground?: boolean
  outlined?: boolean
  padding?: string
  disabled?: boolean
  height?: string
  error?: boolean
  endIcon?: ReactNode
  cursor?: Property.Cursor
  sx?: SxProps<Theme>
}) => {
  return (
    <Button
      variant="outlined"
      startIcon={startIcon ? startIcon : null}
      endIcon={endIcon ? endIcon : null}
      sx={[
        (theme) => ({
          textTransform: 'none',
          border:
            enableBackground || outlined
              ? 'none'
              : error
                ? `1px solid ${theme.color.muiError}`
                : `1px solid ${theme.color.borders.border}`,
          bgcolor: enableBackground ? theme.color.gray[150] : '',
          '&:hover': {
            bgcolor: disabled ? 'white' : theme.color.gray[100],
            border:
              enableBackground || outlined
                ? 'none'
                : error
                  ? `1px solid ${theme.color.muiError}`
                  : `1px solid ${theme.color.borders.border}`,
          },
          '.MuiTouchRipple-child': {
            bgcolor: theme.color.borders.border,
          },
          padding: padding ? padding : { xs: '2px 9px', md: '4px 16px' },
          cursor: disabled ? 'auto' : (cursor ?? 'pointer'),
          '& .MuiButton-startIcon': {
            '& .MuiAvatar-root': {
              fontSize: '14px',
              fontWeight: '400',
            },
            marginLeft: '0px',
            marginRight: '6px',
          },
          height: height ?? '32px',
          minWidth: 'auto',
          transition: 'none',
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
