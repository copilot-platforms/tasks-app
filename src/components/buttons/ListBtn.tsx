'use client'

import { Box, Stack, Theme, Typography } from '@mui/material'
import { ReactNode } from 'react'

export const ListBtn = ({
  content,
  handleClick,
  icon,
  contentColor,
}: {
  content: string
  handleClick: () => void
  icon: ReactNode
  contentColor: string | ((theme: Theme) => string)
}) => {
  return (
    <Box
      p="4px 0px"
      sx={{
        border: (theme) => `1px solid ${theme.color.gray[150]}`,
        borderRadius: '4px',
        width: '138px',
        cursor: 'pointer',
        background: (theme) => theme.color.gray[100],
      }}
      onClick={handleClick}
    >
      <Stack
        direction="row"
        columnGap={'10px'}
        sx={{
          background: '#ffffff',
          ':hover': {
            backgroundColor: (theme) => theme.color.background.bgCallout,
          },
        }}
        p="9px 12px"
        alignItems="center"
      >
        <Box>{icon}</Box>
        <Typography variant="bodySm" color={contentColor}>
          {content}
        </Typography>
      </Stack>
    </Box>
  )
}
