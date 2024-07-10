import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { AddIcon, TasksListIcon } from '@/icons'
import { setShowModal } from '@/redux/features/createTaskSlice'
import store from '@/redux/store'
import { UserType } from '@/types/interfaces'
import { SxCenter } from '@/utils/mui'
import { Box, Stack, Typography } from '@mui/material'

const DashboardEmptyState = ({ userType }: { userType: UserType }) => {
  return (
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
            <TasksListIcon />

            <Typography variant="lg" lineHeight={'32px'}>
              {userType == UserType.INTERNAL_USER ? " You don't have any tasks yet" : 'No tasks assigned'}
            </Typography>
            <Typography variant="bodyLg" sx={{ color: (theme) => theme.color.gray[500] }}>
              {userType == UserType.INTERNAL_USER
                ? 'Tasks will be shown here after they’re created. You can create a new task below.'
                : 'Tasks will show here once they’ve been assigned to you. '}
            </Typography>
          </Stack>
          {userType == UserType.INTERNAL_USER && (
            <Box>
              <PrimaryBtn
                startIcon={<AddIcon />}
                buttonText="New Task"
                handleClick={() => {
                  store.dispatch(setShowModal())
                }}
              />
            </Box>
          )}
        </Stack>
      </Box>
    </AppMargin>
  )
}

export default DashboardEmptyState
