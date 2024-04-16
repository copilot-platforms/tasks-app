'use client'

import { Box, Stack, Typography } from '@mui/material'
import { PrimaryBtn } from '../buttons/PrimaryBtn'
import { Add } from '@mui/icons-material'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import store from '@/redux/store'
import { setShowModal } from '@/redux/features/createTaskSlice'

export const Header = ({ dontIncludeCreateTaskButton }: { dontIncludeCreateTaskButton: boolean }) => {
  return (
    <Box
      sx={{
        border: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
      }}
    >
      <AppMargin size={SizeofAppMargin.LARGE} py="18.5px">
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="lg">Tasks</Typography>
          {!dontIncludeCreateTaskButton && (
            <PrimaryBtn
              startIcon={<Add />}
              buttonText="New Task"
              handleClick={() => {
                store.dispatch(setShowModal())
              }}
            />
          )}
        </Stack>
      </AppMargin>
    </Box>
  )
}
