'use client'

import { MoreHoriz } from '@mui/icons-material'
import { Stack } from '@mui/material'

export const MoreBtn = ({
  handleClick,
  isSecondary,
}: {
  handleClick: (e: React.MouseEvent<HTMLElement>) => void
  isSecondary: Boolean
}) => {
  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      width="25px"
      height="25px"
      sx={(theme) => ({
        padding: 0,
        ':hover': {
          background: isSecondary ? theme.color.gray[200] : theme.color.gray[100],
          border: `1px solid ${theme.color.borders.border3}`,
          cursor: 'pointer',
          borderRadius: isSecondary ? '5px' : 1,
          padding: isSecondary ? '5px' : null,
        },
      })}
      onClick={handleClick}
    >
      <MoreHoriz
        fontSize="small"
        sx={{
          color: '#000000',
        }}
      />
    </Stack>
  )
}
