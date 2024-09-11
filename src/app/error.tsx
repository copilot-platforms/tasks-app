'use client'

import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { isProd } from '@/config'
import { Box, Stack } from '@mui/material'
import React from 'react'

const ClientErrorBoundary = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  const errorMessage =
    error.message === 'Please provide a Valid Token' ? error.message : isProd ? 'Something went wrong' : error.message
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        marginTop: '20vh',
        justifyContent: 'center',
        fontSize: 'clamp(20px, 4vw, 42px)',
        fontFamily: 'monospace',
      }}
    >
      <Stack direction="column" rowGap={3}>
        {errorMessage}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PrimaryBtn buttonText="Try again" handleClick={reset} />
        </Box>
      </Stack>
    </Box>
  )
}

export default ClientErrorBoundary
