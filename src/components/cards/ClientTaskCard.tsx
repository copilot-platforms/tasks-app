'use client'

import { Avatar, Box, Stack, Typography } from '@mui/material'
import { SecondaryBtn } from '../buttons/SecondaryBtn'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'

export const ClientTaskCard = () => {
  return (
    <Box
      sx={{
        ':hover': {
          bgcolor: (theme) => theme.color.gray[100],
        },
      }}
    >
      <AppMargin size={SizeofAppMargin.LARGE} py="6px">
        <Stack direction="row" columnGap={8} alignItems="center">
          <Stack sx={{ width: '100%' }} direction="column">
            <Typography variant="sm">Submit your intake info</Typography>
            <Typography variant="bodySm">
              On the sidebar you should see a notification besides “Forms” and “Contracts”. There are two onboarding forms to
              fill out and one contract to sign to begin the engagement.
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" minWidth="300px" columnGap="20px">
            <Box minWidth="fit-content">
              <Typography variant="bodySm">Apr 05, 2024</Typography>
            </Box>

            <Stack direction="row" alignItems="center">
              <Avatar src={'https://avatar.iran.liara.run/public/3'} sx={{ width: '20px', height: '20px' }} />
              <Typography variant="bodySm">John Doe</Typography>
            </Stack>
            <Box minWidth="fit-content" ml="12px">
              <SecondaryBtn
                handleClick={() => {}}
                buttonContent={
                  <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[700] }}>
                    Mark done
                  </Typography>
                }
              />
            </Box>
          </Stack>
        </Stack>
      </AppMargin>
    </Box>
  )
}
