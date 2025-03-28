'use client'

import { StyledBox } from '@/app/detail/ui/styledComponent'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { Box, Stack, Typography, styled } from '@mui/material'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { ReactNode } from 'react'

interface ConfirmUIProps {
  handleCancel: () => void
  handleConfirm: () => void
  buttonText: string
  title: string
  description: ReactNode | string
}

export const ConfirmUI = ({
  handleCancel,
  handleConfirm,
  buttonText,
  title = 'Are you sure?',
  description = `This action can't be undone.`,
}: ConfirmUIProps) => {
  return (
    <UIContainer sx={{ width: { xs: '80%', sm: '540px' } }}>
      <StyledBox>
        <Stack direction="column" rowGap={4} sx={{ padding: '12px 12px 12px 20px' }}>
          <Typography variant="lg">{title}</Typography>
        </Stack>
      </StyledBox>
      <StyledBox>
        <Stack direction="column" rowGap={4} sx={{ padding: '20px' }}>
          <Typography variant="bodyMd">{description}</Typography>
        </Stack>
      </StyledBox>

      <Stack direction="row" justifyContent="right" alignItems="center" sx={{ padding: '16px 20px' }}>
        <Stack direction="row" columnGap={4}>
          <SecondaryBtn
            handleClick={handleCancel}
            buttonContent={
              <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[700] }}>
                Cancel
              </Typography>
            }
          />
          <PrimaryBtn handleClick={() => handleConfirm()} buttonText={buttonText} />
        </Stack>
      </Stack>
    </UIContainer>
  )
}

const UIContainer = styled(Box)(({ theme }) => ({
  margin: '0 auto',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  borderRadius: '4px',
  backgroundColor: theme.color.base.white,
  boxShadow: '0px 16px 70px 0px rgba(0, 0, 0, 0.50)',
  border: `1px solid ${theme.color.borders.border2}`,
}))
