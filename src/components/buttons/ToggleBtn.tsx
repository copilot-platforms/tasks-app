'use client'

import { MenuIcon } from '@/icons'
import { Stack } from '@mui/material'

export const ToggleBtn = ({ onClick }: { onClick: () => void }) => {
  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      width="28px"
      height="28px"
      sx={(theme) => ({
        padding: 0,
        borderRadius: 1,
        ':hover': {
          background: theme.color.gray[100],
          border: `1px solid ${theme.color.borders.border3}`,
          cursor: 'pointer',
        },
      })}
      onClick={onClick}
    >
      <MenuIcon />
    </Stack>
  )
}
