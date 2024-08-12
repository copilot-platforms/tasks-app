'use client'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { Box, Stack, Typography } from '@mui/material'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { PlusIcon } from '@/icons'
import { StyledBox, StyledKeyboardIcon, StyledTypography } from '@/app/detail/ui/styledComponent'
import store from '@/redux/store'
import { selectCreateTemplate, setShowTemplateModal } from '@/redux/features/templateSlice'
import { TargetMethod } from '@/types/interfaces'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { IconBtn } from '@/components/buttons/IconBtn'
import { Add } from '@mui/icons-material'

export const ManageTemplateHeader = () => {
  const router = useRouter()
  const { token } = useSelector(selectTaskBoard)
  const { templates } = useSelector(selectCreateTemplate)

  return (
    <StyledBox>
      <AppMargin size={SizeofAppMargin.LARGE} py="16px">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" columnGap={3}>
            <SecondaryBtn
              buttonContent={
                <StyledTypography variant="sm" onClick={() => router.push(`/?token=${token}`)}>
                  Tasks
                </StyledTypography>
              }
              enableBackground
            />
            <StyledKeyboardIcon />
            <Typography variant="sm">Manage Templates</Typography>
          </Stack>
          {templates?.length > 0 && (
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
                  buttonText="New Template"
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
