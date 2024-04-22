import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TaskEditor } from '@/app/detail/ui/TaskEditor'
import { Box, Stack, Typography } from '@mui/material'
import { Sidebar } from '@/app/detail/ui/Sidebar'
import { taskDetail } from '@/utils/mockData'
import { UserType } from '@/types/interfaces'
import { decodeParamString } from '@/utils/generateParamString'
import { apiUrl } from '@/config'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { StyledBox, StyledKeyboardIcon, StyledTypography } from '@/app/detail/ui/styledComponent'
import Link from 'next/link'
import { revalidateTag } from 'next/cache'

export const revalidate = 0

async function getOneTask(token: string, taskId: string): Promise<TaskResponse> {
  const res = await fetch(`${apiUrl}/api/tasks/${taskId}?token=${token}`, {
    next: { tags: ['getOneTask'], revalidate: 0 },
  })

  const data = await res.json()

  return data.task
}

export default async function TaskDetailPage({
  params,
  searchParams,
}: {
  params: { task_id: string; task_name: string; user_type: UserType }
  searchParams: { token: string }
}) {
  const { token } = searchParams
  const { task_id } = params

  const task = await getOneTask(token, task_id)

  return (
    <>
      <StyledBox>
        <AppMargin size={SizeofAppMargin.LARGE} py="16px">
          <Stack direction="row" alignItems="center" columnGap={3}>
            <Link href={`/?token=${token}`}>
              <SecondaryBtn buttonContent={<StyledTypography variant="sm">Tasks</StyledTypography>} enableBackground />
            </Link>
            <StyledKeyboardIcon />
            <Typography variant="sm">{params.task_id.toLocaleUpperCase()}</Typography>
          </Stack>
        </AppMargin>
      </StyledBox>
      <Stack direction="row">
        <Box
          sx={{
            width: 'calc(100% - 339px)',
          }}
        >
          <AppMargin size={SizeofAppMargin.LARGE} py="30px">
            <TaskEditor
              attachment={taskDetail.attachment}
              title={decodeParamString(params.task_name)}
              detail={task.body || ''}
              isEditable={params.user_type === UserType.INTERNAL_USER}
              updateTaskDetail={async (title, detail) => {
                'use server'
                fetch(`${apiUrl}/api/tasks/${task_id}?token=${token}`, {
                  method: 'PATCH',
                  body: JSON.stringify({
                    title,
                    body: detail,
                  }),
                })
                revalidateTag('getOneTask')
                revalidateTag('getAllTasks')
              }}
            />
          </AppMargin>
        </Box>
        <Box>
          <Sidebar selectedWorkflowState={task.workflowState} />
        </Box>
      </Stack>
    </>
  )
}
