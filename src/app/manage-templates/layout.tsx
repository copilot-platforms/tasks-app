'use client'

import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { StyledBox, StyledKeyboardIcon, StyledTypography } from '../detail/ui/styledComponent'
import { Stack, Typography } from '@mui/material'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { PlusIcon } from '@/icons'
import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <StyledBox>
        <AppMargin size={SizeofAppMargin.LARGE} py="16px">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" columnGap={3}>
              <SecondaryBtn buttonContent={<StyledTypography variant="sm">Tasks</StyledTypography>} enableBackground />
              <StyledKeyboardIcon />
              <Typography variant="sm">Manage Templates</Typography>
            </Stack>
            <PrimaryBtn handleClick={() => {}} buttonText="New Template" startIcon={<PlusIcon />} />
          </Stack>
        </AppMargin>
      </StyledBox>
      {children}
    </>
  )
}
