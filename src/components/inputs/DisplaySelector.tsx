import { BoardViewIcon, DisplayOptionsIcon, ListViewIcon } from '@/icons'
import { Menu, MenuItem, Stack, styled, Typography } from '@mui/material'
import { ViewMode } from '@prisma/client'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { useState } from 'react'
import { StyledSwitch } from '@/components/inputs/StyledSwitch'

interface Prop {
  handleModeChange: (mode: ViewMode) => void
  selectedMode: ViewMode
}

export const DisplaySelector = ({ handleModeChange, selectedMode }: Prop) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <SecondaryBtn
        buttonContent={
          <Typography variant="bodySm" sx={{ color: (theme) => theme.color.gray[600], fontSize: '12px' }}>
            Display
          </Typography>
        }
        startIcon={<DisplayOptionsIcon />}
        height="31.25px"
        padding="4px 8px 4px 10px"
        handleClick={handleClick}
      />
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              width: '240px',
              paddingBottom: '4px',
              alignItems: 'flex-start',
              borderRadius: '8px',
              border: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
              background: (theme) => theme.color.base.white,
              boxShadow: '0px 6px 20px 0px rgba(0, 0, 0, 0.07)',
              padding: '12px 12px 8px 12px',
            },
          },
        }}
        MenuListProps={{ sx: { py: 0 } }}
      >
        <Stack
          direction="row"
          columnGap={'8px'}
          sx={{
            alignItems: 'flex-start',
            alignSelf: 'stretch',
            paddingBottom: '8px',
          }}
        >
          <IconContainer direction="column" onClick={() => handleModeChange(ViewMode.list)}>
            <ListViewIcon />
            <Typography variant="bodySm" fontSize={'12px'}>
              List
            </Typography>
          </IconContainer>

          <IconContainer direction="column" onClick={() => handleModeChange(ViewMode.board)}>
            <BoardViewIcon />
            <Typography variant="bodySm" fontSize={'12px'}>
              Board
            </Typography>
          </IconContainer>
        </Stack>
        <Stack
          direction="row"
          columnGap={'8px'}
          sx={{
            display: 'flex',
            alignSelf: 'stretch',
            alignItems: 'center',
            padding: '4px 0px',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="bodyMd"> Show unarchived tasks</Typography>
          <StyledSwitch />
        </Stack>
        <Stack
          direction="row"
          columnGap={'8px'}
          sx={{
            display: 'flex',
            alignSelf: 'stretch',
            alignItems: 'center',
            padding: '4px 0px',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="bodyMd"> Show archived tasks</Typography>
          <StyledSwitch />
        </Stack>
      </Menu>
    </>
  )
}

const IconContainer = styled(Stack)(({ theme }) => ({
  display: 'flex',
  padding: '6px 4px 2px 4px',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1px',
  width: '100%',
  height: 'auto',
  cursor: 'pointer',
  border: `1px solid ${theme.color.gray[150]}`,
  borderRadius: '4px',
  '&:hover': {
    background: theme.color.gray[100],
  },
}))
