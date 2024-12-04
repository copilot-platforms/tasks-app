'use client'

import { MoreHoriz } from '@mui/icons-material'
import { Stack } from '@mui/material'

export const MoreBtn = ({
  handleClick,
  isSecondary,
  displayButtonBackground = true,
  displayBorder = true,
}: {
  handleClick: (e: React.MouseEvent<HTMLElement>) => void
  isSecondary: Boolean
  displayButtonBackground?: Boolean
  displayBorder?: Boolean
}) => {
  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      width="25px"
      height="25px"
      sx={(theme) =>
        displayButtonBackground
          ? {
              padding: 0,
              ':hover': {
                background: isSecondary ? theme.color.gray[200] : theme.color.gray[100],
                border: displayBorder ? `1px solid ${theme.color.borders.border3}` : 'none',
                cursor: 'pointer',
                borderRadius: isSecondary ? '5px' : 1,
                padding: isSecondary ? '5px' : null,
              },
            }
          : {
              background: 'none !important',
              ':hover': {
                background: theme.color.gray[150] + ' !important',
                cursor: 'pointer',
                borderRadius: isSecondary ? '5px' : 1,
                padding: isSecondary ? '5px' : null,
              },
            }
      }
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
