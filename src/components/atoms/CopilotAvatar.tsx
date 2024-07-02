import { IAssigneeCombined } from '@/types/interfaces'
import { Avatar } from '@mui/material'

interface CopilotAvatarProps {
  currentAssignee: IAssigneeCombined
}

export const CopilotAvatar = ({ currentAssignee }: CopilotAvatarProps) => {
  console.log(currentAssignee)
  if (currentAssignee.iconImageUrl || currentAssignee.avatarImageUrl || currentAssignee.givenName === 'No assignee') {
    return (
      <Avatar
        alt={currentAssignee.givenName}
        src={currentAssignee.iconImageUrl || currentAssignee.avatarImageUrl || 'user'}
        sx={{ width: '20px', height: '20px' }}
        variant={currentAssignee.type === 'companies' ? 'rounded' : 'circular'}
      />
    )
  }

  return (
    <Avatar
      alt={currentAssignee?.givenName}
      sx={{ bgcolor: currentAssignee.fallbackColor, width: '20px', height: '20px', fontSize: '13px' }}
      variant={currentAssignee.type === 'companies' ? 'rounded' : 'circular'}
    >
      {currentAssignee?.givenName?.[0] || currentAssignee?.familyName?.[0] || currentAssignee?.name || '?'}
    </Avatar>
  )
}
