'use client'

import { GrayAddIcon } from '@/icons'
import { Box, SxProps, Theme } from '@mui/material'

interface AddBtnProps {
  handleClick: () => unknown
  sx: SxProps<Theme>
}

export const AddBtn = ({ handleClick, sx = {} }: AddBtnProps) => {
  return (
    <Box sx={{ ':hover': { cursor: 'pointer' }, ...sx }}>
      <GrayAddIcon onClick={handleClick} />
    </Box>
  )
}
