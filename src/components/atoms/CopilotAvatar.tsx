import { NoAssigneeAvatarLarge, PersonIconSmall, PersonIcon } from '@/icons'
import { copilotTheme } from '@/theme/copilot'
import { IAssigneeCombined } from '@/types/interfaces'
import { getAssigneeName } from '@/utils/assignee'
import { Avatar, Box, SxProps, Theme } from '@mui/material'
import { ReactNode } from 'react'

interface CopilotAvatarProps {
  currentAssignee?: IAssigneeCombined
  alt?: string
  width?: string
  height?: string
  fontSize?: string
  sx?: SxProps<any>
  size?: 'small' | 'large'
  icon?: ReactNode
}

export const CopilotAvatar = ({
  currentAssignee,
  alt,
  width = '20px',
  height = '20px',
  fontSize = '14px',
  sx,
  size,
  icon,
}: CopilotAvatarProps) => {
  const avatarSx: SxProps<Theme> = {
    ...sx,
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: (theme) => theme.color.background.avatarBackground,
    fontSize,
    '.MuiAvatar-img': {
      objectFit: 'cover',
    },
  }
  const avatarVariant: 'circular' | 'rounded' | 'square' = currentAssignee?.type === 'companies' ? 'rounded' : 'circular'

  if (icon) {
    return (
      <Avatar sx={avatarSx} variant={avatarVariant}>
        {icon}
      </Avatar>
    )
  }
  if (!currentAssignee || (currentAssignee?.name || currentAssignee?.givenName) === 'No assignee') {
    return (
      <Box sx={{ marginTop: (sx as { marginTop?: string })?.marginTop || '0px' }}>
        {size == 'small' ? <PersonIconSmall /> : size == 'large' ? <NoAssigneeAvatarLarge /> : <PersonIcon />}
      </Box>
    )
  }
  if (currentAssignee?.iconImageUrl || currentAssignee?.avatarImageUrl) {
    return (
      <Avatar
        alt={alt || currentAssignee?.givenName}
        src={currentAssignee?.iconImageUrl || currentAssignee?.avatarImageUrl}
        sx={avatarSx}
        variant={avatarVariant}
      />
    )
  }

  return (
    <Avatar
      alt={alt || currentAssignee?.givenName}
      sx={{
        ...avatarSx,
        bgcolor: currentAssignee?.fallbackColor || copilotTheme.colors.green,
      }}
      variant={avatarVariant}
    >
      {getAssigneeName(currentAssignee)[0].toUpperCase()}
    </Avatar>
  )
}
