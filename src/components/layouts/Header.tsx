'use client'

import { Box, Stack, Typography } from '@mui/material'
import { PrimaryBtn } from '../buttons/PrimaryBtn'

import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import store from '@/redux/store'
import { setShowModal } from '@/redux/features/createTaskSlice'
import { IconBtn } from '../buttons/IconBtn'
import { AddIcon } from '@/icons'

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
            <>
              <Box>
                <PrimaryBtn
                  startIcon={<AddIcon />}
                  buttonText="New Task"
                  handleClick={() => {
                    store.dispatch(setShowModal())
                  }}
                />
              </Box>
            </>
          )}
        </Stack>
      </AppMargin>
    </Box>
  )
}
