import { TasksListIcon } from '@/icons'
import { SxCenter } from '@/utils/mui'
import { Box, Stack } from '@mui/material'

const DashboardEmptyState = () => {
  return (
    <Box sx={{ height: '100vh', width: '100vw', ...SxCenter }}>
      <Stack gap={'12px'}>
        <TasksListIcon />
      </Stack>
      <Box></Box>
    </Box>
  )
}

export default DashboardEmptyState
