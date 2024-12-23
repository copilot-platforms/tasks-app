'use client'

import { Box, Stack, Typography } from '@mui/material'
import { PrimaryBtn } from '../buttons/PrimaryBtn'

import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import store from '@/redux/store'
import { setShowModal } from '@/redux/features/createTaskSlice'
import { IconBtn } from '../buttons/IconBtn'
import { AddIcon, AddLargeIcon } from '@/icons'
import { MenuBoxContainer } from '@/app/ui/MenuBoxContainer'

interface HeaderProps {
  showCreateTaskButton: boolean
  showMenuBox?: boolean
}

export const Header = ({ showCreateTaskButton, showMenuBox = true }: HeaderProps) => {
  return (
    <Box>
      <AppMargin size={SizeofAppMargin.HEADER} py="14px">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="lg">Tasks</Typography>

          {showCreateTaskButton && (
            <Stack direction="row" alignItems="center" columnGap={'14px'}>
              {showMenuBox && <MenuBoxContainer />}
              <>
                <Box
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  <PrimaryBtn
                    startIcon={<AddIcon />}
                    buttonText="Create task"
                    handleClick={() => {
                      store.dispatch(setShowModal())
                    }}
                  />
                </Box>
                <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                  <IconBtn
                    handleClick={() => {
                      store.dispatch(setShowModal())
                    }}
                    padding="8px"
                    icon={<AddLargeIcon />}
                  />
                </Box>
              </>
            </Stack>
          )}
        </Stack>
      </AppMargin>
    </Box>
  )
}
