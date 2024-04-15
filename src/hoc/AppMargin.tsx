import { Box } from '@mui/material'
import { ReactNode } from 'react'

export enum SizeofAppMargin {
  MEDIUM = 'medium',
  LARGE = 'large',
  SMALL = 'small',
}

export const AppMargin = ({
  children,
  size,
  py,
}: {
  children: ReactNode
  size: SizeofAppMargin
  py?: string | undefined
}) => {
  if (size === SizeofAppMargin.LARGE) {
    return <Box sx={{ padding: `${py ? py : '0px'} 36px` }}>{children}</Box>
  }

  if (size === SizeofAppMargin.MEDIUM) {
    return <Box sx={{ padding: `${py ? py : '0px'} 28px` }}>{children}</Box>
  }

  if (size === SizeofAppMargin.SMALL) {
    return <Box sx={{ padding: `${py ? py : '0px'} 25px` }}>{children}</Box>
  }
}
