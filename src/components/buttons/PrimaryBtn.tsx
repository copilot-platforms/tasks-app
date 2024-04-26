import { Add } from '@mui/icons-material'
import { Button, Typography } from '@mui/material'
import { ReactNode } from 'react'

export const PrimaryBtn = ({
  startIcon,
  buttonText,
  handleClick,
  buttonBackground,
}: {
  startIcon?: ReactNode
  buttonText: string
  handleClick: () => void
  buttonBackground?: string
}) => {
  return (
    <Button
      variant="contained"
      startIcon={startIcon ? <Add /> : null}
      sx={(theme) => ({
        textTransform: 'none',
        bgcolor: buttonBackground || theme.color.gray[600],
        '&:hover': { backgroundColor: buttonBackground || theme.color.gray[600] },
      })}
      onClick={() => handleClick()}
    >
      <Typography variant="sm">{buttonText}</Typography>
    </Button>
  )
}
