import { IconButton } from '@mui/material'
import { ReactNode } from 'react'

export const IconBtn = ({
  icon,
  handleClick,
  buttonBackground,
  padding,
}: {
  icon: ReactNode
  handleClick: () => void
  buttonBackground?: string
  padding?: string
}) => {
  return (
    <IconButton
      sx={(theme) => ({
        textTransform: 'none',
        bgcolor: buttonBackground || theme.color.gray[600],
        padding: padding ? padding : '2px',
        borderRadius: '4px',
        '&:hover': { backgroundColor: buttonBackground || theme.color.gray[600] },
      })}
      onClick={handleClick}
    >
      {icon}
    </IconButton>
  )
}
