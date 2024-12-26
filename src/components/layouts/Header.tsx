'use client'

import { MenuBoxContainer } from '@/app/ui/MenuBoxContainer'
import { IconBtn } from '@/components/buttons/IconBtn'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { AddIcon, AddLargeIcon } from '@/icons'
import { setShowModal } from '@/redux/features/createTaskSlice'
import store from '@/redux/store'
import { Box, Stack, Typography } from '@mui/material'

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
