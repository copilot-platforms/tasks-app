'use client'

import { GrayAddIcon } from '@/icons'
import { Box, Stack, styled, SxProps, Theme } from '@mui/material'

interface AddBtnProps {
  handleClick: () => unknown
  sx?: SxProps<Theme>
}

export const AddBtn = ({ handleClick, sx = {} }: AddBtnProps) => {
  return (
    <Box
      sx={{
        border: '2px solid transparent',

        ':hover': { cursor: 'pointer', background: (theme) => theme.color.gray[150] },
        ':focus-visible': {
          border: '2px solid #0071E3',
          borderRadius: '4px',
          outline: 'none',
        },
        borderRadius: '3px',
        ...sx,
      }}
      tabIndex={0}
    >
      <IconContainer justifyContent="center" alignItems="center">
        <GrayAddIcon onClick={handleClick} />
      </IconContainer>
    </Box>
  )
}

const IconContainer = styled(Stack)({
  width: '22px',
  height: '22px',

  padding: '3px',
  alignItems: 'center',
  justifyContent: 'center',
})
