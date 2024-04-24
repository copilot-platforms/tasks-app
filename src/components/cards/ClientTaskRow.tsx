'use client'

import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { Typography, Box, Stack } from '@mui/material'

export const ClientTaskRow = () => {
  return (
    <Box
      sx={{
        background: (theme) => theme.color.gray[100],
      }}
    >
      <AppMargin size={SizeofAppMargin.LARGE} py="6px">
        <Stack direction="row" columnGap={2}>
          <Typography variant="md">To do</Typography>
          <Typography
            variant="sm"
            sx={{
              color: (theme) => theme.color.gray[400],
            }}
          >
            4
          </Typography>
        </Stack>
      </AppMargin>
    </Box>
  )
}
