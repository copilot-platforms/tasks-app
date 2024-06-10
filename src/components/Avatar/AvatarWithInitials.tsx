import { AvatarTypography } from '@/app/detail/ui/styledComponent'
import { Avatar, AvatarProps } from '@mui/material'

interface AvatarWithInitialsProps extends AvatarProps {
  src?: string
  altName?: string
}

const AvatarWithInitials: React.FC<AvatarWithInitialsProps> = ({ src, altName, ...props }) => {
  return (
    <Avatar src={src} alt={altName} {...props}>
      {altName && <AvatarTypography> {altName[0]} </AvatarTypography>}
    </Avatar>
  )
}

export default AvatarWithInitials
