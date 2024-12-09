import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TasksListIcon } from '@/icons'
import { SxCenter } from '@/utils/mui'
import { Box, Stack, Typography } from '@mui/material'

export const NoFilteredTasksState = () => {
  return (
    <>
      <AppMargin size={SizeofAppMargin.LARGE} py="20px">
        <Box
          sx={{
            display: 'flex',
            height: 'calc(100vh - 160px)',
            ...SxCenter,
          }}
        >
          <Stack rowGap={'12px'} direction={'column'} width={'359px'}>
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
              No tasks found
            </Typography>
            <Typography variant="bodyLg" sx={{ color: (theme) => theme.color.gray[500] }}>
              Try removing or changing the filters.
            </Typography>
          </Stack>
        </Box>
      </AppMargin>
    </>
  )
}
