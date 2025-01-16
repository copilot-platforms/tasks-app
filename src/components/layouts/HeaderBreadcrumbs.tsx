'use client'

import { StyledKeyboardIcon, StyledTypography } from '@/app/detail/ui/styledComponent'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { CustomLink } from '@/hoc/CustomLink'
import { useBreadcrumbs } from '@/hooks/app-bridge/useBreadcrumbs'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { UserType } from '@/types/interfaces'
import { Stack, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'

type ValidTasksBoardLink = '/' | '/client'

export const HeaderBreadcrumbs = ({
  token,
  title,
  userType,
  portalUrl,
}: {
  token: string | undefined
  title: string
  userType: UserType
  portalUrl?: string
}) => {
  const { previewMode } = useSelector(selectTaskBoard)
  const router = useRouter()

  const getTasksLink = (userType: UserType): ValidTasksBoardLink => {
    if (previewMode) return '/client'

    const tasksLinks: Record<UserType, ValidTasksBoardLink> = {
      [UserType.INTERNAL_USER]: '/',
      [UserType.CLIENT_USER]: '/client',
    }
    return tasksLinks[userType]
  }
  useBreadcrumbs(
    [
      {
        label: 'Tasks',
        onClick: () => router.push(getTasksLink(userType) + `?token=${token}`),
      },
      {
        label: title,
      },
    ],
    { portalUrl },
  )

  if (!previewMode) {
    return null
  }

  return (
    <Stack direction="row" alignItems="center" columnGap={3}>
      <CustomLink href={{ pathname: getTasksLink(userType), query: { token } }}>
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
