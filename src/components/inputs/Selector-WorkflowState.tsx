import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { Sizes } from '@/types/interfaces'
import { statusIcons } from '@/utils/iconMatcher'
import { Box, ClickAwayListener, Popper, Stack, Theme, Typography } from '@mui/material'
import React, { ReactNode, useState } from 'react'
import { SecondaryBtn } from '../buttons/SecondaryBtn'
import { CopilotTooltip, CopilotTooltipProps } from '@/components/atoms/CopilotTooltip'

type WorkflowStateSelectorProps = {
  value: WorkflowStateResponse
  option: WorkflowStateResponse[]
  disabled?: boolean
  getValue: (value: WorkflowStateResponse) => void
  variant?: 'outlined' | 'icon' | 'normal'
  responsiveNoHide?: boolean
  size?: Exclude<Sizes, Sizes.LARGE>
  padding?: string
  height?: string
  gap?: string
  hoverColor?: keyof Theme['color']['gray']
  tooltipProps?: Omit<CopilotTooltipProps, 'content' | 'children'>
}

export const WorkflowStateSelector = ({
  value,
  option,
  disabled,
  getValue,
  variant = 'outlined',
  responsiveNoHide,
  size = Sizes.SMALL,
  padding,
  height,
  gap,
  hoverColor,
  tooltipProps,
}: WorkflowStateSelectorProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const id = open ? 'selector-workflowStateSelector-popper' : ''

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
          {variant == 'normal' ? (
            <Stack
              direction="row"
              alignItems="center"
              columnGap={gap ?? '7px'}
              justifyContent="flex-start"
              sx={{
                padding: padding || '4px 8px',
                justifyContent: { xs: 'end', sm: 'flex-start' },
                cursor: disabled ? 'auto' : 'pointer',
              }}
            >
              <Box>{statusIcons[Sizes.MEDIUM][value?.type]}</Box>
              <Typography
                variant="md"
                sx={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  display: { xs: responsiveNoHide ? 'block' : 'none', sm: 'block' },
                  lineHeight: '22px',
                  userSelect: 'none',
                  fontWeight: 400,
                }}
              >
                {value?.name as ReactNode}
              </Typography>
            </Stack>
          ) : variant === 'outlined' ? (
            <SecondaryBtn
              padding={padding}
              height={height}
              buttonContent={
                <Stack direction="row" alignItems={'center'} columnGap={gap ?? '8px'}>
                  {statusIcons[size][value?.type]}
                  {size == Sizes.SMALL ? (
                    <Typography variant="bodySm" sx={{ color: (theme) => theme.color.gray[600], fontSize: '14px' }}>
                      {value?.name as ReactNode}
                    </Typography>
                  ) : (
                    <Typography variant="md" lineHeight="22px">
                      {value?.name as ReactNode}
                    </Typography>
                  )}
                </Stack>
              }
            />
          ) : (
            // Right now Tooltip support is applied to the icon variant only
            <CopilotTooltip
              content={'Change status'}
              disabled={tooltipProps?.disabled || disabled}
              position={tooltipProps?.position}
            >
              <Box
                sx={{
                  padding: padding,
                  borderRadius: '4px',
                  ':hover': {
                    cursor: 'pointer',
                    background: (theme) => (disabled ? '' : theme.color.gray[hoverColor ?? 150]),
                  },
                }}
              >
                {statusIcons[size][value?.type]}
              </Box>
            </CopilotTooltip>
          )}
        </Box>
        <Popper
          id={id}
          open={open}
          anchorEl={anchorEl}
          sx={{
            width: 'fit-content',
            zIndex: '99999999',
          }}
          placement="bottom-start"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <Stack
            direction="column"
            sx={{
              boxShadow: '0px 6px 20px 0px rgba(0, 0, 0, 0.12)',
              background: (theme) => theme.color.base.white,
              borderRadius: '4px',
            }}
            rowGap={'2px'}
          >
            {option.map((el, key) => {
              return (
                <Stack
                  direction="row"
                  key={key}
                  columnGap="12px"
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    padding: '4px 8px',
                    width: '180px',
                    ':hover': {
                      cursor: 'pointer',
                      background: (theme) => theme.color.gray[100],
                    },
                  }}
                  onClick={() => {
                    getValue(el)
                    setAnchorEl(null)
                  }}
                >
                  <Box padding={'4px 0px'}>{statusIcons[Sizes.MEDIUM][el?.type]}</Box>
                  <Typography variant="bodySm" fontWeight={400} lineHeight={'21px'}>
                    {el.name}
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
