'use client'

import { Box, Stack, Typography } from '@mui/material'
import { PrimaryBtn } from '../buttons/PrimaryBtn'
import { Add } from '@mui/icons-material'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import store from '@/redux/store'
import { setShowModal } from '@/redux/features/createTaskSlice'
import { IconBtn } from '../buttons/IconBtn'

export const Header = ({ showCreateTaskButton }: { showCreateTaskButton: boolean }) => {
  return (
    <Box
      sx={{
        border: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
      }}
    >
      <AppMargin size={SizeofAppMargin.LARGE} py="18.5px">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="lg">Tasks</Typography>
          {showCreateTaskButton && (
            <Box
              sx={{
                display: { xs: 'none', sm: 'block' },
              }}
            >
              <PrimaryBtn
                startIcon={<Add />}
                buttonText="New Task"
                handleClick={() => {
                  store.dispatch(setShowModal())
                }}
              />
            </Box>
          )}
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            <IconBtn
              handleClick={() => {
                store.dispatch(setShowModal())
              }}
              icon={<Add sx={{ color: '#fff' }} />}
            />
          </Box>
        </Stack>
      </AppMargin>
    </Box>
  )
}
