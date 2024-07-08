import { NoAssigneeAvatar, NoAssigneeAvatarSmall } from '@/icons'
import { copilotTheme } from '@/theme/copilot'
import { IAssigneeCombined } from '@/types/interfaces'
import { Avatar, SxProps } from '@mui/material'

interface CopilotAvatarProps {
  currentAssignee?: IAssigneeCombined
  alt?: string
  width?: string
  height?: string
  isSmall?: boolean
  fontSize?: string
}

export const CopilotAvatar = ({
  currentAssignee,
  alt,
  width = '20px',
  height = '20px',
  isSmall = false,
  fontSize = '13px',
}: CopilotAvatarProps) => {
  const avatarSx: SxProps = {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize,
    '.MuiAvatar-img': {
      objectFit: 'cover',
    },
  }
  const avatarVariant: 'circular' | 'rounded' | 'square' = currentAssignee?.type === 'companies' ? 'rounded' : 'circular'

  if (!currentAssignee || currentAssignee?.name || currentAssignee?.givenName === 'No assignee') {
    return isSmall ? <NoAssigneeAvatarSmall /> : <NoAssigneeAvatar />
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
      {currentAssignee?.givenName?.[0] || currentAssignee?.familyName?.[0] || currentAssignee?.name?.[0] || '?'}
    </Avatar>
  )
}
