'use client'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { Stack, Typography } from '@mui/material'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { PlusIcon } from '@/icons'
import { StyledBox, StyledKeyboardIcon, StyledTypography } from '@/app/detail/ui/styledComponent'
import store from '@/redux/store'
import { setShowTemplateModal } from '@/redux/features/templateSlice'

export const ManageTemplateHeader = ({ showNewTemplateButton }: { showNewTemplateButton: boolean }) => {
  return (
    <StyledBox>
      <AppMargin size={SizeofAppMargin.LARGE} py="16px">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" columnGap={3}>
            <SecondaryBtn buttonContent={<StyledTypography variant="sm">Tasks</StyledTypography>} enableBackground />
            <StyledKeyboardIcon />
            <Typography variant="sm">Manage Templates</Typography>
          </Stack>
          {showNewTemplateButton && (
            <PrimaryBtn
              handleClick={() => {
                store.dispatch(setShowTemplateModal())
              }}
              buttonText="New Template"
              startIcon={<PlusIcon />}
            />
          )}
        </Stack>
      </AppMargin>
    </StyledBox>
  )
}
