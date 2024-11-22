'use client'

import { DustbinIcon } from '@/icons'
import { Stack, Typography } from '@mui/material'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'

export const ArchiveBtn = ({ isArchived, handleClick }: { isArchived: boolean; handleClick: () => void }) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      columnGap="6px"
      sx={{
        padding: '3px 8px',
        ':hover': {
          cursor: 'pointer',
          border: ' 1px solid #EOEOEO, rgba(0, 0, 0, 0.12))',
          borderRadius: '4px',
        },
      }}
      onClick={handleClick}
    >
      <SecondaryBtn
        startIcon={<DustbinIcon />}
        buttonContent={
          <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[600] }}>
            {!isArchived ? 'Archive' : 'Unarchive'}
          </Typography>
        }
      />
    </Stack>
  )
}
