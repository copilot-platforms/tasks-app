import { FilterButtons } from '@/components/buttonsGroup/FilterButtonsGroup'
import { DropdownIcon } from '@/icons'
import { Box, ClickAwayListener, Popper, Stack, Typography } from '@mui/material'
import { useState } from 'react'

export const FilterButtonsGroupSelector = ({
  filterButtons,
  activeButtonIndex,
}: {
  filterButtons: FilterButtons[]
  activeButtonIndex: number
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const id = open ? 'filterButtons-selector-popper' : ''

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (event.key === 'Escape') {
      setAnchorEl(null)
    }
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  return (
    <ClickAwayListener
      onClickAway={() => {
        setAnchorEl(null)
      }}
    >
      <Box
        onKeyDown={handleKeyDown}
        tabIndex={0}
        sx={{
          outline: 'none',
          boxShadow: 'none',
          borderRadius: '4px',
          flexDirection: 'row',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          height: '40px',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleClick(e)
        }}
      >
        <Typography variant="bodyMd"> {filterButtons[activeButtonIndex].name} </Typography>
        <Box sx={{ padding: '10px 0px' }}>
          <DropdownIcon />
        </Box>
        <Popper
          id={id}
          open={open}
          anchorEl={anchorEl}
          sx={{
            width: 'fit-content',
            zIndex: '999',
          }}
          placement="bottom-start"
          onClick={(e) => {
            e.stopPropagation()
          }}
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, -2],
              },
            },
          ]}
        >
          <Stack
            direction="column"
            sx={{
              boxShadow: '0px 6px 20px 0px rgba(0, 0, 0, 0.07)',
              background: (theme) => theme.color.base.white,
              border: (theme) => `1px solid ${theme.color.gray[150]}`,
              borderRadius: '4px',
              display: 'flex',
              width: '134px',
              padding: '4px 0px',
              flexDirection: 'column',
              alignItems: 'flex-start',
              overflow: 'hidden',
            }}
            rowGap={'2px'}
          >
            {filterButtons.map((item, index) => {
              return (
                <Stack
                  direction="row"
                  key={item.id}
                  columnGap="12px"
                  sx={(theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px  16px 4px 12px',
                    lineHeight: '22px',
                    gap: '8px',
                    color: theme.color.text.textPrimary,
                    alignSelf: 'stretch',
                    background: 'white',
                    ':hover': {
                      cursor: 'pointer',
                      background: theme.color.gray[100],
                    },
                  })}
                  onClick={() => {
                    item.onClick(index)
                    setAnchorEl(null)
                  }}
                >
                  <Typography variant="bodySm" fontWeight={400} lineHeight={'21px'}>
                    {item.name}
                  </Typography>
                </Stack>
              )
            })}
          </Stack>
        </Popper>
      </Box>
    </ClickAwayListener>
  )
}
