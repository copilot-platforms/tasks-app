'use client'

import { StyledKeyboardIcon, StyledTypography } from '@/app/detail/ui/styledComponent'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { CustomLink } from '@/hoc/CustomLink'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { UserType } from '@/types/interfaces'
import { Stack, Typography } from '@mui/material'
import { useSelector } from 'react-redux'

type ValidTasksBoardLinks = '/' | '/client'

export const HeaderBreadcrumbs = ({
  token,
  title,
  userType,
}: {
  token: string | undefined
  title: string
  userType: UserType
}) => {
  const { previewMode } = useSelector(selectTaskBoard)

  const getTasksLink = (userType: UserType): ValidTasksBoardLinks => {
    if (previewMode) return '/client'

    const tasksLinks: Record<UserType, ValidTasksBoardLinks> = {
      [UserType.INTERNAL_USER]: '/',
      [UserType.CLIENT_USER]: '/client',
    }
    return tasksLinks[userType]
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
