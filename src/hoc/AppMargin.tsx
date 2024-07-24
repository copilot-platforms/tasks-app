import { Box, SxProps } from '@mui/material'
import { ReactNode } from 'react'

export enum SizeofAppMargin {
  MEDIUM = 'medium',
  LARGE = 'large',
  SMALL = 'small',
  CUSTOM = 'custom',
}

export const AppMargin = ({
  children,
  size,
  py,
  sx,
  px,
}: {
  children: ReactNode
  size: SizeofAppMargin
  py?: string
  sx?: SxProps
  px?: string
}) => {
  if (size === SizeofAppMargin.LARGE) {
    return <Box sx={{ ...sx, padding: { xs: `${py ? py : '0px'} 20px`, sm: `${py ? py : '0px'} 36px` } }}>{children}</Box>
  }

  if (size === SizeofAppMargin.MEDIUM) {
    return <Box sx={{ ...sx, padding: { xs: `${py ? py : '0px'} 20px`, sm: `${py ? py : '0px'} 28px` } }}>{children}</Box>
  }

  if (size === SizeofAppMargin.SMALL) {
    return <Box sx={{ ...sx, padding: { xs: `${py ? py : '0px'} 20px`, sm: `${py ? py : '0px'} 25px` } }}>{children}</Box>
  }
  if (size === SizeofAppMargin.CUSTOM) {
    return (
      <Box
        sx={{
          ...sx,
          padding: { xs: `${py ? py : '12px'} ${px ? px : '18px'}`, sm: `${py ? py : '19.5px'} ${px ? px : '20px'}` },
        }}
      >
        {children}
      </Box>
    )
  }
}
