import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { FilterByAsigneeIcon } from '@/icons'
import { FilterType } from '@/types/common'
import { Box, ClickAwayListener, Popper, Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { FilterTypeSection } from './FilterTypeSection'
import { FilterAssigneeSection } from './FilterAssigneeSection'

type FilterSelectorProps = {
  disabled?: boolean
}

export const FilterSelector = ({ disabled }: FilterSelectorProps) => {
  const [filterMode, setFilterMode] = useState<FilterType | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const id = open ? 'filter-selector-popper' : ''

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      setAnchorEl(anchorEl ? null : event.currentTarget)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (event.key === 'Escape') {
      setAnchorEl(null)
    }
  }

  useEffect(() => {
    if (filterMode && !open) {
      setFilterMode(null)
    }
  }, [open, filterMode])

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
        }}
      >
        <Box
          onClickCapture={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleClick(e)
          }}
          aria-describedby={id}
        >
          <SecondaryBtn
            padding={'2px 8px'}
            height={'32px'}
            sx={(theme) => ({
              borderColor: theme.color.borders.borderDisabled,
            })}
            buttonContent={
              <Stack direction="row" alignItems={'center'} columnGap={'6px'}>
                <FilterByAsigneeIcon className="text-gray-500" />
                <Typography
                  sx={(theme) => ({
                    color: theme.color.text.textSecondary,
                    fontSize: theme.typography.bodySm,
                    lineHeight: '21px',
                  })}
                >
                  Filters
                </Typography>
              </Stack>
            }
          />
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
                offset: [0, 1],
              },
            },
          ]}
        >
          {!filterMode ? (
            <FilterTypeSection setFilterMode={setFilterMode} />
          ) : (
            <FilterAssigneeSection filterMode={filterMode} setAnchorEl={setAnchorEl} />
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  )
}
