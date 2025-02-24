'use client'

import { MoreBtn } from '@/components/buttons/MoreBtn'
import { Box, ClickAwayListener, Grow, Popper } from '@mui/material'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'

export const MenuBox = ({
  menuContent,
  className,
  isSecondary = false,
  displayButtonBackground,
  displayBorder,
  noHover,
  setIsMenuOpen,
  height,
  width,
  customIcon,
  getMenuOpen,
}: {
  menuContent: ReactNode
  className?: string
  isSecondary?: boolean
  displayButtonBackground?: boolean
  displayBorder?: boolean
  noHover?: boolean
  setIsMenuOpen?: Dispatch<SetStateAction<boolean>>
  height?: string
  width?: string
  customIcon?: ReactNode
  getMenuOpen?: (open: boolean) => void
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
    setIsMenuOpen?.(Boolean(anchorEl ? null : event.currentTarget))
  }

  const open = Boolean(anchorEl)

  const id = open ? 'menu-box-popper' : undefined

  useEffect(() => {
    getMenuOpen?.(open)
  }, [open, getMenuOpen])

  return (
    <ClickAwayListener
      onClickAway={() => {
        setAnchorEl(null)
        setIsMenuOpen?.(false)
      }}
    >
      <Box className="menubox">
        <Box aria-describedby={id} className={className}>
          <MoreBtn
            handleClick={(e) => handleClick(e)}
            isSecondary={isSecondary}
            displayButtonBackground={displayButtonBackground}
            displayBorder={displayBorder}
            noHover={noHover}
            height={height}
            width={width}
            customIcon={customIcon}
          />
        </Box>
        <Popper
          id={id}
          open={open}
          anchorEl={anchorEl}
          placement="bottom-end"
          transition
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 4],
              },
            },
          ]}
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps} style={{ transformOrigin: 'top right' }}>
              <Box
                sx={(theme) => ({
                  border: `1px solid ${theme.color.gray[150]}`,
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  boxShadow: '0px 6px 20px 0px rgba(0, 0, 0, 0.12)',
                })}
                p="2px 0px"
              >
                {menuContent}
              </Box>
            </Grow>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  )
}
