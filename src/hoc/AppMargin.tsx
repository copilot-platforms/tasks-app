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
  ptb,
}: {
  children: ReactNode
  size: SizeofAppMargin
  ptb?: string | undefined
}) => {
  if (size === SizeofAppMargin.LARGE) {
    return <Box sx={{ padding: `${ptb ? ptb : '0px'} 36px` }}>{children}</Box>
  }

  if (size === SizeofAppMargin.MEDIUM) {
    return <Box sx={{ padding: `${ptb ? ptb : '0px'} 28px` }}>{children}</Box>
  }

  if (size === SizeofAppMargin.SMALL) {
    return <Box sx={{ padding: `${ptb ? ptb : '0px'} 25px` }}>{children}</Box>
  }
}
