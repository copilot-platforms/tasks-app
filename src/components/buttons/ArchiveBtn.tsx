'use client'

import { DustbinIcon } from '@/icons'
import { Stack, Typography } from '@mui/material'

export const ArchiveBtn = ({ state }: { state: 'Archive' | 'Unarchive' }) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      columnGap="6px"
      sx={{
        borderRadius: '4px',
        padding: '3px 8px',
        ':hover': {
          cursor: 'pointer',
          border: ' 1px solid var(--Black-Alpha-1, rgba(0, 0, 0, 0.12))',
        },
      }}
    >
      <DustbinIcon />
      <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[600] }}>
        {state}
      </Typography>
    </Stack>
  )
}
