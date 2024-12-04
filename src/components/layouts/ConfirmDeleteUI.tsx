'use client'

import { StyledBox } from '@/app/detail/ui/styledComponent'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { Box, Stack, Typography, styled } from '@mui/material'
import { SecondaryBtn } from '../buttons/SecondaryBtn'
import { PrimaryBtn } from '../buttons/PrimaryBtn'

interface Prop {
  handleCancel: () => void
  handleDelete: () => void
  bodyTag?: 'task' | 'comment' | 'template'
  customBody?: string
  description?: string
}

export const ConfirmDeleteUI = ({
  handleCancel,
  handleDelete,
  bodyTag = 'task',
  customBody,
  description = `This action can't be undone.`,
}: Prop) => {
  return (
    <UIContainer sx={{ width: { xs: '80%', sm: '470px' } }}>
      <StyledBox>
        <AppMargin size={SizeofAppMargin.MEDIUM} py="20px">
          <Stack direction="column" rowGap={4}>
            <Typography variant="2xl" sx={{ fontSize: { xs: '18px', sm: '24px' }, lineHeight: { xs: '26px', md: '32px' } }}>
              {customBody ? customBody : `Are you sure you want to delete this ${bodyTag}?`}
            </Typography>
            <Typography
              variant="lg"
              sx={{
                color: (theme) => theme.color.gray[500],
                fontSize: { xs: '14px', sm: '16px' },
                lineHeight: { xs: '20px', md: '24px' },
              }}
            >
              {description}
            </Typography>
          </Stack>
        </AppMargin>
      </StyledBox>
      <AppMargin size={SizeofAppMargin.MEDIUM} py="21px">
        <Stack direction="row" justifyContent="right" alignItems="center">
          <Stack direction="row" columnGap={4}>
            <SecondaryBtn
              handleClick={handleCancel}
              buttonContent={
                <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[700] }}>
                  Cancel
                </Typography>
              }
            />
            <PrimaryBtn handleClick={() => handleDelete()} buttonText="Delete" buttonBackground="#CC0000" />
          </Stack>
        </Stack>
      </AppMargin>
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
  backgroundColor: '#ffffff',
  boxShadow: '0px 16px 70px 0px rgba(0, 0, 0, 0.50)',
  border: `1px solid ${theme.color.borders.border2}`,
}))
