import { Add } from '@mui/icons-material'
import { Button, Typography } from '@mui/material'
import { ReactNode } from 'react'

export const PrimaryBtn = ({
  startIcon,
  buttonText,
  handleClick,
}: {
  startIcon?: ReactNode | undefined
  buttonText: string
  handleClick: () => void
}) => {
  return (
    <Button
      variant="contained"
      startIcon={startIcon ? <Add /> : null}
      sx={(theme) => ({
        textTransform: 'none',
        bgcolor: theme.color.gray[600],
        '&:hover': { backgroundColor: theme.color.gray[600] },
      })}
      onClick={handleClick}
    >
      <Typography variant="sm">{buttonText}</Typography>
    </Button>
  )
}
