import { SxProps, Theme } from '@mui/material'

export const SxCenter: SxProps = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

export const applySx = (sx?: SxProps<Theme>) => {
  return Array.isArray(sx) ? sx : sx ? [sx] : []
}
