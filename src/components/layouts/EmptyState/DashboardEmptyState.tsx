'use client'

import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { AddIcon, TasksListIcon } from '@/icons'
import { setShowModal } from '@/redux/features/createTaskSlice'
import store from '@/redux/store'
import { UserType } from '@/types/interfaces'
import { SxCenter } from '@/utils/mui'
import { Box, Stack, Typography } from '@mui/material'
import { usePathname } from 'next/navigation'

const DashboardEmptyState = ({ userType }: { userType: UserType }) => {
  const pathname = usePathname()
  console.log(pathname.includes('client'))
  return (
    <>
      <AppMargin size={SizeofAppMargin.LARGE} py="20px">
        <Box
          sx={{
            display: 'flex',
            height: '80vh',
            ...SxCenter,
          }}
        >
          <Stack rowGap={'20px'} direction={'column'} sx={{ width: '453px' }}>
            <Stack rowGap={'12px'} direction={'column'}>
              <Box
                sx={{
                  padding: '6px',
                  background: (theme) => theme.color.gray[150],
                  width: '40px',
                  borderRadius: '6px',
                  gap: '20px',
                  height: '40px',
                }}
              >
                <TasksListIcon />
              </Box>

              <Typography variant="2xl" lineHeight={'32px'}>
                {userType == UserType.INTERNAL_USER ? " You don't have any tasks yet" : 'No tasks assigned'}
              </Typography>
              <Typography variant="bodyLg" sx={{ color: (theme) => theme.color.gray[500] }}>
                {userType == UserType.INTERNAL_USER
                  ? 'Tasks will be shown here after they’re created. You can create a new task below.'
                  : 'Tasks will show here once they’ve been assigned to you. '}
              </Typography>
            </Stack>
            {userType === UserType.INTERNAL_USER && !!!pathname.includes('client') && (
              <Box>
                <PrimaryBtn
                  startIcon={<AddIcon />}
                  buttonText="New task"
                  handleClick={() => {
                    store.dispatch(setShowModal())
                  }}
                />
              </Box>
            )}
          </Stack>
        </Box>
      </AppMargin>
    </>
  )
}

export default DashboardEmptyState
