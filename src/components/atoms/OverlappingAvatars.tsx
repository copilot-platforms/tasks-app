import { NoAssigneeAvatar, NoAssigneeAvatarSmall, NoAssigneeAvatarLarge } from '@/icons'
import { copilotTheme } from '@/theme/copilot'
import { IAssigneeCombined } from '@/types/interfaces'
import { getAssigneeName } from '@/utils/assignee'
import { Avatar, SxProps, Theme } from '@mui/material'

type OverlappingAvatarsProps = {
  assignees: (IAssigneeCombined | undefined)[]
  width?: string
  height?: string
  fontSize?: string
  sx?: SxProps
  size?: 'small' | 'large' | 'default'
  alt?: string
}

export const OverlappingAvatars: React.FC<OverlappingAvatarsProps> = ({
  assignees,
  width = '20px',
  height = '20px',
  fontSize = '14px',
  sx,
  size = 'default',
}) => {
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
    position: 'relative',
    zIndex: 1,
    '&:not(:last-child)': {
      marginRight: `-${Number(width.replace('px', '')) / 2}px`,
    },
  }

  const renderAvatar = (assignee: IAssigneeCombined | undefined, index: number) => {
    const avatarVariant: 'circular' | 'rounded' | 'square' = assignee?.type === 'companies' ? 'rounded' : 'circular'

    if (!assignee || assignee?.name || assignee?.givenName === 'No assignee') {
      return (
        <Avatar
          key={index}
          sx={{
            ...avatarSx,
            border: (theme) => `1.1px solid ${theme.color.gray[200]}`,
            zIndex: assignees.length + index,
          }}
          variant={avatarVariant}
        >
          <NoAssigneeAvatar />
        </Avatar>
      )
    }

    if (assignee?.iconImageUrl || assignee?.avatarImageUrl) {
      return (
        <Avatar
          key={index}
          alt={getAssigneeName(assignee)}
          src={assignee?.iconImageUrl || assignee?.avatarImageUrl}
          sx={{
            ...avatarSx,
            zIndex: assignees.length + index,
            border: (theme) => `1.1px solid ${theme.color.gray[200]}`,
          }}
          variant={avatarVariant}
        />
      )
    }

    return (
      <Avatar
        key={index}
        alt={getAssigneeName(assignee)}
        sx={{
          ...avatarSx,
          bgcolor: assignee?.fallbackColor || copilotTheme.colors.green,
          border: (theme) => `1.1px solid ${theme.color.gray[200]}`,
          zIndex: assignees.length + index,
        }}
        variant={avatarVariant}
      >
        {getAssigneeName(assignee)[0].toUpperCase()}
      </Avatar>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: 'fit-content',
      }}
    >
      {assignees.slice(0, 3).map(renderAvatar)}
    </div>
  )
}
