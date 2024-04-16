import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TaskEditor } from '@/app/detail/ui/TaskEditor'
import { Box, Stack } from '@mui/material'
import { Sidebar } from '@/app/detail/ui/Sidebar'
import { taskDetail } from '@/utils/mockData'
import { UserType } from '@/types/interfaces'

export default function TaskDetailPage({ params }: { params: { task_id: string; task_name: string; user_type: UserType } }) {
  console.log(params.user_type)
  return (
    <Stack direction="row">
      <Box
        sx={{
          width: 'calc(100% - 339px)',
        }}
      >
        <AppMargin size={SizeofAppMargin.LARGE} py="30px">
          <TaskEditor
            attachment={taskDetail.attachment}
            title={taskDetail.title}
            detail={taskDetail.detail}
            isEditable={params.user_type === UserType.INTERNAL_USER ? true : false}
          />
        </AppMargin>
      </Box>
      <Box>
        <Sidebar />
      </Box>
    </Stack>
  )
}
