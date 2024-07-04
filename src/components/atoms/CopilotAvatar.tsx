import { copilotTheme } from '@/theme/copilot'
import { IAssigneeCombined } from '@/types/interfaces'
import { Avatar, SxProps } from '@mui/material'

interface CopilotAvatarProps {
  currentAssignee?: IAssigneeCombined
  alt?: string
  width?: string
  height?: string
}

export const CopilotAvatar = ({ currentAssignee, alt, width = '20px', height = '20px' }: CopilotAvatarProps) => {
  const avatarSx: SxProps = {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    '.MuiAvatar-img': {
      objectFit: 'cover',
    },
  }
  const avatarVariant: 'circular' | 'rounded' | 'square' = currentAssignee?.type === 'companies' ? 'rounded' : 'circular'

  if (!currentAssignee || currentAssignee?.givenName === 'No assignee') {
    return <Avatar alt="" src="user" sx={avatarSx} variant="circular" />
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
        fontSize: '13px',
      }}
      variant={avatarVariant}
    >
      {currentAssignee?.givenName?.[0] || currentAssignee?.familyName?.[0] || currentAssignee?.name?.[0] || '?'}
    </Avatar>
  )
}
