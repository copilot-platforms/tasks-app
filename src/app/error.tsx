'use client'

import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { isProd } from '@/config'
import { Box, Stack } from '@mui/material'

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
        fontSize: '20px',
        fontFamily: 'monospace',
        padding: '48px',
      }}
    >
      <Stack direction="column" rowGap={6}>
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
