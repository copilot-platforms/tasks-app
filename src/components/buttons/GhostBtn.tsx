'use client'

import { Box, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'

export const GhostBtn = ({
  buttonText,
  handleClick,
  startIcon,
}: {
  buttonText: string
  handleClick: () => void
  startIcon?: ReactNode
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        cursor: 'pointer',
      }}
    >
      <Stack
        direction="row"
        columnGap={'6px'}
        alignItems={'center'}
        sx={{
          padding: '5px',
          ':hover': {
            backgroundColor: (theme) => theme.color.gray[100],
          },
          borderRadius: '4px',
          userSelect: 'none',
        }}
        onClick={handleClick}
      >
        {startIcon && startIcon}
        <Typography
          sx={{
            color: (theme) => theme.color.text.textSecondary,
          }}
          lineHeight="22px"
          variant="md"
        >
          {buttonText}
        </Typography>
      </Stack>
    </Box>
  )
}
