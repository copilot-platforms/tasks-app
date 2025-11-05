import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { Sizes } from '@/types/interfaces'
import { statusIcons } from '@/utils/iconMatcher'
import { Box, Popper, Stack, Theme, Typography } from '@mui/material'
import React, { ReactNode, useRef, useState } from 'react'
import { SecondaryBtn } from '../buttons/SecondaryBtn'
import { CopilotTooltip, CopilotTooltipProps } from '@/components/atoms/CopilotTooltip'
import useClickOutside from '@/hooks/useClickOutside'

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
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const popperRef = useRef<HTMLDivElement>(null)
  const id = open ? 'selector-workflowStateSelector-popper' : ''

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const handleClick = () => {
    if (!disabled) {
      setOpen((prev) => !prev)
    }
  }

  // Close when clicked outside both the box and the popper
  useClickOutside([anchorRef, popperRef], () => setOpen(false))

  return (
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
          handleClick()
        }}
        ref={anchorRef}
        aria-describedby={id}
      >
        {variant == 'normal' ? (
          <Stack
            direction="row"
            alignItems="center"
            columnGap={gap ?? '7px'}
            justifyContent="flex-start"
            sx={{
              padding: '4px',
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
                  <Typography variant="bodySm" sx={{ color: (theme) => theme.color.gray[600], fontSize: '12px' }}>
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
        anchorEl={anchorRef.current}
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
          ref={popperRef}
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
                  setOpen(false)
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
  )
}
