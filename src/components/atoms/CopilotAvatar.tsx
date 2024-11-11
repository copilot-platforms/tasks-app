import { NoAssigneeAvatar, NoAssigneeAvatarSmall } from '@/icons'
import { copilotTheme } from '@/theme/copilot'
import { IAssigneeCombined } from '@/types/interfaces'
import { getAssigneeName } from '@/utils/assignee'
import { Avatar, SxProps } from '@mui/material'
import { Theme } from '@mui/material/styles/createTheme'

interface CopilotAvatarProps {
  currentAssignee?: IAssigneeCombined
  alt?: string
  width?: string
  height?: string
  isSmall?: boolean
  fontSize?: string
  sx?: SxProps<any>
}

export const CopilotAvatar = ({
  currentAssignee,
  alt,
  width = '20px',
  height = '20px',
  isSmall = false,
  fontSize = '14px',
  sx,
}: CopilotAvatarProps) => {
  const avatarSx: SxProps = {
    ...sx,
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

  if (!currentAssignee || (currentAssignee?.name || currentAssignee?.givenName) === 'No assignee') {
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
      {getAssigneeName(currentAssignee)[0].toUpperCase()}
    </Avatar>
  )
}
