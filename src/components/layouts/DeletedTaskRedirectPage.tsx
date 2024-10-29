'use client'

import { UserRole } from '@/app/api/core/types/user'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TasksListIcon } from '@/icons'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { SxCenter } from '@/utils/mui'
import { Box, Stack, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { z } from 'zod'

export const DeletedTaskRedirectPage = ({ userType }: { userType: UserRole }) => {
  const router = useRouter()
  const { token } = useSelector(selectTaskBoard)
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
                No task to show
              </Typography>
              <Typography variant="bodyLg" sx={{ color: (theme) => theme.color.gray[500] }}>
                This task has been deleted. You can view your other tasks on the Tasks homepage.
              </Typography>
            </Stack>
            <Box>
              <PrimaryBtn
                buttonText="New task"
                handleClick={() => {
                  router.push(`/${userType === UserRole.Client ? 'client' : ''}?token=${z.string().parse(token)}`)
                }}
              />
            </Box>
          </Stack>
        </Box>
      </AppMargin>
    </>
  )
}
