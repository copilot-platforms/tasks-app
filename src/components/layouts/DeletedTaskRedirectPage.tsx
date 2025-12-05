'use client'

import { UserRole } from '@/app/api/core/types/user'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TasksListIcon } from '@/icons'

import { SxCenter } from '@/utils/mui'
import { Box, Button, Stack, Typography } from '@mui/material'
import Link from 'next/link'

import { z } from 'zod'

export const DeletedTaskRedirectPage = ({
  userType,
  token,
  fromNotificationCenter,
}: {
  userType: UserRole
  token: string
  fromNotificationCenter: boolean
}) => {
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
                  background: '#EFF1F4',
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
              <Typography variant="bodyLg" sx={{ color: '#6B6F76' }}>
                This task has been deleted. You can view your other tasks on the Tasks homepage.
              </Typography>
            </Stack>
            {/* disable board navigation on notification-center-view */}
            {!fromNotificationCenter && (
              <Link href={`/${userType === UserRole.Client ? 'client' : ''}?token=${z.string().parse(token)}`}>
                <Button
                  variant="contained"
                  startIcon={null}
                  sx={{
                    textTransform: 'none',
                    bgcolor: '#212B36',
                    boxShadow: 'none',
                    '&:hover': { backgroundColor: '#212B36', boxShadow: 'none' },
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  disableRipple
                  disableTouchRipple
                >
                  <Typography variant="sm">View tasks</Typography>
                </Button>
              </Link>
            )}
          </Stack>
        </Box>
      </AppMargin>
    </>
  )
}
