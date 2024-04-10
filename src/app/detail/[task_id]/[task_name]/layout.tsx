import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { Stack, Typography } from '@mui/material'
import { StyledBox, StyledKeyboardIcon, StyledTypography } from '../../ui/styledComponent'
import Link from 'next/link'

export default function TaskDetailPageLayout({ params }: { params: { task_id: string; task_name: string } }) {
  return (
    <StyledBox>
      <AppMargin size={SizeofAppMargin.LARGE} ptb="16px">
        <Stack direction="row" alignItems="center" columnGap={3}>
          <Link href="/">
            <SecondaryBtn buttonContent={<StyledTypography variant="sm">Tasks</StyledTypography>} enableBackground />
          </Link>
          <StyledKeyboardIcon />
          <Typography variant="sm">{params.task_id.toLocaleUpperCase()}</Typography>
        </Stack>
      </AppMargin>
    </StyledBox>
  )
}
