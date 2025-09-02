import { Box, SxProps } from '@mui/material'
import { ReactNode } from 'react'

export enum SizeofAppMargin {
  MEDIUM = 'medium',
  LARGE = 'large',
  SMALL = 'small',
  CUSTOM = 'custom',
  HEADER = 'header',
  TASKBOARD = 'taskboard',
}

export const AppMargin = ({
  children,
  size,
  py,
  sx,
}: {
  children: ReactNode
  size: SizeofAppMargin
  py?: string
  sx?: SxProps
}) => {
  if (size === SizeofAppMargin.LARGE) {
    return <Box sx={{ ...sx, padding: { xs: `${py ? py : '0px'} 20px`, sm: `${py ? py : '0px'} 36px` } }}>{children}</Box>
  }

  if (size === SizeofAppMargin.MEDIUM) {
    return <Box sx={{ ...sx, padding: { xs: `${py ? py : '0px'} 20px` } }}>{children}</Box>
  }

  if (size === SizeofAppMargin.SMALL) {
    return <Box sx={{ ...sx, padding: { xs: `${py ? py : '0px'} 20px`, sm: `${py ? py : '0px'} 25px` } }}>{children}</Box>
  }
  if (size === SizeofAppMargin.HEADER) {
    return (
      <Box
        sx={{
          ...sx,
          padding: { xs: `${py ? py : '12px'} 20px`, sm: `${py ? py : '19.5px'} 20px` },
        }}
      >
        {children}
      </Box>
    )
  }
}
