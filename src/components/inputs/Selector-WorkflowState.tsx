import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { SecondaryBtn } from '../buttons/SecondaryBtn'
import { statusIcons, statusIconsMedium, statusIconsSmall } from '@/utils/iconMatcher'
import { Box, ClickAwayListener, Popper, Stack, Typography } from '@mui/material'
import { ReactNode, useState } from 'react'

export const WorkflowStateSelector = ({
  value,
  option,
  disabled,
  getValue,
  disableOutline,
  responsiveNoHide,
}: {
  value: WorkflowStateResponse
  option: WorkflowStateResponse[]
  disabled?: boolean
  getValue: (value: WorkflowStateResponse) => void
  disableOutline?: boolean
  responsiveNoHide?: boolean
}) => {
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
        }}
      >
        <Box onClick={handleClick} aria-describedby={id}>
          {disableOutline ? (
            <Stack
              direction="row"
              alignItems="center"
              columnGap="7px"
              justifyContent="flex-start"
              sx={{
                padding: '4px 8px',
                justifyContent: { xs: 'end', sm: 'flex-start' },
                cursor: disabled ? 'auto' : 'default',
                borderRadius: '4px',
              }}
            >
              <Box>{statusIcons[value?.type]}</Box>
              <Typography
                variant="md"
                sx={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  display: { xs: responsiveNoHide ? 'block' : 'none', sm: 'block' },
                  lineHeight: '22px',
                }}
              >
                {value?.name as ReactNode}
              </Typography>
            </Stack>
          ) : (
            <SecondaryBtn
              startIcon={statusIconsSmall[value?.type]}
              buttonContent={
                <Typography variant="bodySm" sx={{ color: (theme) => theme.color.gray[600], fontSize: '12px' }}>
                  {value?.name as ReactNode}
                </Typography>
              }
            />
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
        >
          <Stack
            direction="column"
            sx={{
              boxShadow: '0px 6px 20px 0px rgba(0, 0, 0, 0.12)',
              background: (theme) => theme.color.base.white,
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
                  <Box padding={'4px 0px'}>{statusIconsMedium[el?.type]}</Box>
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
