'use client'

import { Box, Stack, Theme, Typography } from '@mui/material'
import { ReactNode } from 'react'

export const ListBtn = ({
  content,
  handleClick,
  icon,
  contentColor,
  width,
}: {
  content: string
  handleClick: () => void
  icon: ReactNode
  contentColor: string | ((theme: Theme) => string)
  width?: string
}) => {
  return (
    <Box
      p="2px 0px"
      sx={{
        borderRadius: '4px',
        width: width ? width : '138px',
        cursor: 'pointer',
        background: (theme) => theme.color.base.white,
        ':hover': {
          backgroundColor: (theme) => theme.color.background.bgCallout,
        },
      }}
      onClick={handleClick}
    >
      <Stack
        direction="row"
        columnGap={'10px'}
        sx={{
          borderRadius: '4px',
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
