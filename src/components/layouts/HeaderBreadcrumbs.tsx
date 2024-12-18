'use client'

import { StyledKeyboardIcon, StyledTypography } from '@/app/detail/ui/styledComponent'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { CustomLink } from '@/hoc/CustomLink'
import { UserType } from '@/types/interfaces'
import { Stack, Typography } from '@mui/material'

export const HeaderBreadcrumbs = ({
  token,
  title,
  userType,
}: {
  token: string | undefined
  title: string
  userType?: UserType
}) => {
  return (
    <Stack direction="row" alignItems="center" columnGap={3}>
      <CustomLink href={{ pathname: userType === UserType.CLIENT_USER ? `/client` : `/`, query: { token } }}>
        <SecondaryBtn
          buttonContent={
            <StyledTypography variant="sm" lineHeight={'21px'} sx={{ fontSize: '13px' }}>
              Tasks
            </StyledTypography>
          }
          variant="breadcrumb"
        />
      </CustomLink>
      <StyledKeyboardIcon />
      <Typography
        variant="sm"
        sx={{
          fontSize: '13px',
        }}
      >
        {title}
      </Typography>
    </Stack>
  )
}
