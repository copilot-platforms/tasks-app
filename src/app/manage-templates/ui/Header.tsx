'use client'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { Box, Stack, Typography } from '@mui/material'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { PlusIcon } from '@/icons'
import { StyledBox, StyledKeyboardIcon, StyledTypography } from '@/app/detail/ui/styledComponent'
import store from '@/redux/store'
import { setShowTemplateModal } from '@/redux/features/templateSlice'
import { TargetMethod } from '@/types/interfaces'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { IconBtn } from '@/components/buttons/IconBtn'
import { Add } from '@mui/icons-material'
import { HeaderBreadcrumbs } from '@/components/layouts/HeaderBreadcrumbs'

export const ManageTemplateHeader = ({ showNewTemplateButton }: { showNewTemplateButton: boolean }) => {
  const { token } = useSelector(selectTaskBoard)
  return (
    <StyledBox>
      <AppMargin size={SizeofAppMargin.LARGE} py="16px">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <HeaderBreadcrumbs title="Manage templates" token={token} />
          {showNewTemplateButton && (
            <>
              <Box
                sx={{
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                <PrimaryBtn
                  handleClick={() => {
                    store.dispatch(setShowTemplateModal({ targetMethod: TargetMethod.POST }))
                  }}
                  buttonText="Create template"
                  startIcon={<PlusIcon />}
                />
              </Box>
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                <IconBtn
                  handleClick={() => {
                    store.dispatch(setShowTemplateModal({ targetMethod: TargetMethod.POST }))
                  }}
                  icon={<Add sx={{ color: '#fff' }} />}
                />
              </Box>
            </>
          )}
        </Stack>
      </AppMargin>
    </StyledBox>
  )
}
