import { AddIcon } from '@/icons'
import { Button, Typography } from '@mui/material'
import { ReactNode } from 'react'

export const PrimaryBtn = ({
  startIcon,
  buttonText,
  handleClick,
  buttonBackground,
  disabled,
}: {
  startIcon?: ReactNode
  buttonText: string
  handleClick: () => void
  buttonBackground?: string
  disabled?: boolean
}) => {
  return (
    <Button
      variant="contained"
      startIcon={startIcon ? <AddIcon /> : null}
      disabled={disabled}
      sx={(theme) => ({
        textTransform: 'none',
        bgcolor: buttonBackground || theme.color.gray[600],
        '&:hover': { backgroundColor: buttonBackground || theme.color.gray[600] },
        borderRadius: '4px',
      })}
      onClick={() => handleClick()}
    >
      <Typography variant="sm">{buttonText}</Typography>
    </Button>
  )
}
