'use client'

import { Stack, Typography } from '@mui/material'

export const NoTemplateLayout = () => {
  return (
    <Stack
      direction="column"
      rowGap={3}
      sx={{
        position: 'absolute',
        top: '45%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '444px',
      }}
    >
      <Stack
        direction="row"
        justifyContent="center"
        sx={{
          borderRadius: (theme) => theme.shape.radius100,
          background: '#F1F3F8',
          padding: 2,
          width: '40px',
          height: '40px',
        }}
      >
        <h1>icon here</h1>
      </Stack>

      <Typography variant="2xl">Advanced Profile Settings</Typography>
      <Typography variant="bodyMd" fontSize="15px" sx={{ color: (theme) => theme.color.gray[500] }}>
        Advanced settings for your profile will show here if you are given access to them.
      </Typography>
    </Stack>
  )
}
