'use client'

import { MoreHoriz } from '@mui/icons-material'
import { Stack } from '@mui/material'
import { ReactNode } from 'react'

export const MoreBtn = ({
  handleClick,
  isSecondary,
  displayButtonBackground = true,
  displayBorder = true,
  noHover = false,
  height,
  width,
  customIcon,
}: {
  handleClick: (e: React.MouseEvent<HTMLElement>) => void
  isSecondary: Boolean
  displayButtonBackground?: Boolean
  displayBorder?: Boolean
  noHover?: Boolean
  height?: string
  width?: string
  customIcon?: ReactNode
}) => {
  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      width={width ? width : '25px'}
      height={height ? height : '25px'}
      sx={(theme) =>
        displayButtonBackground
          ? {
              padding: noHover && isSecondary ? '5px' : null,
              background: noHover && isSecondary ? theme.color.gray[200] : theme.color.gray[100],
              border: noHover ? `1px solid ${theme.color.borders.border3}` : 'none',
              borderRadius: noHover && isSecondary ? '5px' : 1,
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
              padding: noHover && isSecondary ? '5px' : null,
              border: noHover ? `1px solid ${theme.color.borders.border3}` : 'none',
              borderRadius: noHover && isSecondary ? '5px' : 1,
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
      {customIcon ? (
        customIcon
      ) : (
        <MoreHoriz
          fontSize="small"
          sx={(theme) => ({
            color: theme.color.gray[500],
          })}
        />
      )}
    </Stack>
  )
}
