import { AvatarTypography } from '@/app/detail/ui/styledComponent'
import { Avatar, AvatarProps } from '@mui/material'

interface AvatarWithInitialsProps extends AvatarProps {
  src?: string
  altName?: string
}

const AvatarWithInitials: React.FC<AvatarWithInitialsProps> = ({ src, altName, ...props }) => {
  return (
    <Avatar src={src} alt={altName} {...props}>
      {<AvatarTypography> {altName ? altName : 'user'} </AvatarTypography>}
    </Avatar>
  )
}

export default AvatarWithInitials
