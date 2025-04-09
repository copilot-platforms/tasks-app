'use client'

import { StyledKeyboardIcon, StyledTypography } from '@/app/detail/ui/styledComponent'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { CustomLink } from '@/hoc/CustomLink'
import { useBreadcrumbs } from '@/hooks/app-bridge/useBreadcrumbs'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { UserType } from '@/types/interfaces'
import { Stack, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import { Fragment } from 'react'
import { useSelector } from 'react-redux'

type ValidTasksBoardLink = '/' | '/client'

export const HeaderBreadcrumbs = ({
  token,
  items,
  userType,
  portalUrl,
}: {
  token: string | undefined
  items: { label: string; href?: string }[]
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
    items.map(({ label, href }) => ({ label, onClick: href ? () => router.push(href) : undefined })),
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
      {items.map((item) => (
        <Fragment key={item.label}>
          <StyledKeyboardIcon />
          <Typography
            variant="sm"
            sx={{
              fontSize: '13px',
            }}
          >
            {item.label}
          </Typography>
        </Fragment>
      ))}
    </Stack>
  )
}
