import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TaskEditor } from '../../ui/TaskEditor'
import { Box, Stack } from '@mui/material'
import { Sidebar } from '../../ui/Sidebar'
import { taskDetail } from '@/utils/mockData'

export default function TaskDetailPage() {
  return (
    <Stack direction="row">
      <Box
        sx={{
          width: 'calc(100% - 339px)',
        }}
      >
        <AppMargin size={SizeofAppMargin.LARGE} py="30px">
          <TaskEditor attachment={taskDetail.attachment} title={taskDetail.title} detail={taskDetail.detail} />
        </AppMargin>
      </Box>
      <Box>
        <Sidebar />
      </Box>
    </Stack>
  )
}
