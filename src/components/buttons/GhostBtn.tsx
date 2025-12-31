'use client'

import { Box, Stack, Typography, TypographyVariants } from '@mui/material'
import { ReactNode } from 'react'
import { TypographyProps, TypographyPropsVariantOverrides } from '@mui/material/Typography'

export const GhostBtn = ({
  buttonText,
  handleClick,
  startIcon,
  typographyVariant = 'md',
}: {
  buttonText: string
  handleClick: () => void
  startIcon?: ReactNode
  typographyVariant?: TypographyProps['variant']
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
          variant={typographyVariant}
        >
          {buttonText}
        </Typography>
      </Stack>
    </Box>
  )
}
