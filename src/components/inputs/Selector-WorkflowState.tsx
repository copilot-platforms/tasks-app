import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { SecondaryBtn } from '../buttons/SecondaryBtn'
import { statusIcons } from '@/utils/iconMatcher'
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
              columnGap="4px"
              justifyContent="flex-start"
              sx={{
                padding: '4px 8px',
                justifyContent: { xs: 'end', sm: 'flex-start' },
                cursor: disabled ? 'auto' : 'pointer',
                borderRadius: '4px',
                ':hover': {
                  backgroundColor: (theme) => theme.color.gray[100],
                },
              }}
            >
              <Box>{statusIcons[value?.type]}</Box>
              <Typography
                variant="bodySm"
                sx={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  display: { xs: responsiveNoHide ? 'block' : 'none', sm: 'block' },
                }}
              >
                {value?.name as ReactNode}
              </Typography>
            </Stack>
          ) : (
            <SecondaryBtn
              startIcon={statusIcons[value?.type]}
              buttonContent={
                <Typography variant="bodySm" lineHeight="16px" sx={{ color: (theme) => theme.color.gray[600] }}>
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
          >
            {option.map((el, key) => {
              return (
                <Stack
                  direction="row"
                  key={key}
                  columnGap="12px"
                  sx={{
                    padding: '6px 12px',
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
                  <Box>{statusIcons[el?.type]}</Box>
                  <Typography variant="bodySm" fontWeight={400}>
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
