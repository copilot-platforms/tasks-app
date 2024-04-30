'use client'

import { PlusIcon, TemplateIcon } from '@/icons'
import { Box, Stack, Typography } from '@mui/material'
import { PrimaryBtn } from '../buttons/PrimaryBtn'

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
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{
            borderRadius: '6px',
          }}
        >
          <TemplateIcon />
        </Stack>
      </Stack>

      <Typography variant="2xl">No templates have been created yet</Typography>
      <Typography variant="bodyMd" fontSize="15px" sx={{ color: (theme) => theme.color.gray[500] }}>
        Templates will be shown here
      </Typography>
      <Box width="fit-content">
        <PrimaryBtn handleClick={() => {}} buttonText="New Template" startIcon={<PlusIcon />} />
      </Box>
    </Stack>
  )
}
