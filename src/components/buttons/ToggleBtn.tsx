'use client'

import { MenuIcon, MenuToggleIcon } from '@/icons'
import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { Stack } from '@mui/material'
import { useSelector } from 'react-redux'

/**
 * @deprecated We have dropped support for toggle buttons
 */
export const ToggleBtn = ({ onClick }: { onClick: () => void }) => {
  const { showSidebar } = useSelector(selectTaskDetails)

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
      {showSidebar ? <MenuToggleIcon /> : <MenuIcon />}
    </Stack>
  )
}
