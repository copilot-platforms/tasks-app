import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { Stack, Typography } from '@mui/material'
import { StyledBox, StyledKeyboardIcon, StyledTypography } from '@/app/detail/ui/styledComponent'
import Link from 'next/link'
import { ReactNode } from 'react'
import { UserType } from '@/types/interfaces'

export default function TaskDetailPageLayout({
  params,
  children,
}: {
  params: { task_id: string; task_name: string; user_type: UserType }
  children: ReactNode
}) {
  return (
    <>
      <StyledBox>
        <AppMargin size={SizeofAppMargin.LARGE} py="16px">
          <Stack direction="row" alignItems="center" columnGap={3}>
            <Link href="/">
              <SecondaryBtn buttonContent={<StyledTypography variant="sm">Tasks</StyledTypography>} enableBackground />
            </Link>
            <StyledKeyboardIcon />
            <Typography variant="sm">{params.task_id.toLocaleUpperCase()}</Typography>
          </Stack>
        </AppMargin>
      </StyledBox>
      {children}
    </>
  )
}
