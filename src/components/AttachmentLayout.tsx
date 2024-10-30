'use client'

import { PdfIcon } from '@/icons'
import { Box, Stack, Typography } from '@mui/material'
import React from 'react'

export enum AttachmentStates {
  resting,
  focus,
  hover,
  active,
}

const AttachmentLayout = ({ attachmentState }: { attachmentState: AttachmentStates }) => {
  return (
    <Box
      sx={{
        padding: '4px 8px',
        maxWidth: '490px',
        border: (theme) => `1px solid ${theme.color.gray[150]}`,
        background: '#fff',
        boxShadow: '0px 0px 24px 0px rgba(0, 0, 0, 0.07)',
      }}
    >
      <Stack direction="row" columnGap="5.5px" alignItems="center">
        <PdfIcon />
        <Stack direction="column">
          <Typography
            variant="bodySm"
            lineHeight="21px"
            sx={{
              color: (theme) => theme.color.gray[600],
            }}
          >
            About us
          </Typography>
          <Typography
            variant="bodySm"
            sx={{
              color: (theme) => theme.color.gray[500],
              fontSize: '12px',
            }}
          >
            384 KB
          </Typography>
        </Stack>
      </Stack>
    </Box>
  )
}

export default AttachmentLayout
