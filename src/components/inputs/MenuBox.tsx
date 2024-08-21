'use client'

import { MoreBtn } from '@/components/buttons/MoreBtn'
import { Box, ClickAwayListener, Popper } from '@mui/material'
import { ReactNode, useState } from 'react'

export const MenuBox = ({
  menuContent,
  className,
  isSecondary = false,
}: {
  menuContent: ReactNode
  className?: string
  isSecondary?: boolean
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'menu-box-popper' : undefined

  return (
    <ClickAwayListener
      onClickAway={() => {
        setAnchorEl(null)
      }}
    >
      <Box>
        <Box aria-describedby={id} className={className}>
          <MoreBtn handleClick={(e) => handleClick(e)} isSecondary={isSecondary} />
        </Box>
        <Popper
          id={id}
          open={open}
          anchorEl={anchorEl}
          placement="bottom-end"
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 4],
              },
            },
          ]}
        >
          <Box
            sx={{
              boxShadow: '0px 6px 20px 0px rgba(0, 0, 0, 0.12)',
            }}
          >
            {menuContent}
          </Box>
        </Popper>
      </Box>
    </ClickAwayListener>
  )
}
