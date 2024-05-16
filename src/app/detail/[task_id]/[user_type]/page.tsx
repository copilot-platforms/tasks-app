import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TaskEditor } from '@/app/detail/ui/TaskEditor'
import { Box, Stack, Typography } from '@mui/material'
import { Sidebar } from '@/app/detail/ui/Sidebar'
import { taskDetail } from '@/utils/mockData'
import { IAssignee, IAttachment, UserType } from '@/types/interfaces'
import { apiUrl } from '@/config'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { StyledBox, StyledKeyboardIcon, StyledTypography } from '@/app/detail/ui/styledComponent'
import Link from 'next/link'
import { addTypeToAssignee } from '@/utils/addTypeToAssignee'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { deleteAttachment, deleteTask, postAttachment, updateAssignee, updateTaskDetail } from './actions'
import { updateWorkflowStateIdOfTask } from '@/app/actions'
import { MenuBoxContainer } from '../../ui/MenuBoxContainer'

export const revalidate = 0

async function getOneTask(token: string, taskId: string): Promise<TaskResponse> {
  const res = await fetch(`${apiUrl}/api/tasks/${taskId}?token=${token}`, {
    next: { tags: ['getOneTask'], revalidate: 0 },
  })

  const data = await res.json()

  return data.task
}

async function getAssigneeList(token: string): Promise<IAssignee> {
  const res = await fetch(`${apiUrl}/api/users?token=${token}`, {
    next: { tags: ['getAssigneeList'], revalidate: 0 },
  })

  const data = await res.json()

  return data.users
}

async function getAttachments(token: string, taskId: string): Promise<IAttachment[]> {
  const res = await fetch(`${apiUrl}/api/attachments/?taskId=${taskId}&token=${token}`, {
    next: { tags: ['getAttachments'], revalidate: 0 },
  })
  const data = await res.json()

  return data.attachments
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
  const assignee = addTypeToAssignee(await getAssigneeList(token))
  const attachments = await getAttachments(token, task_id)
  return (
    <ClientSideStateUpdate assignee={assignee}>
      <Stack direction="row">
        <Box
          sx={{
            width: 'calc(100% - 339px)',
          }}
        >
          <StyledBox>
            <AppMargin size={SizeofAppMargin.LARGE} py="16px">
              <Stack direction="row" justifyContent="space-between">
                <Stack direction="row" alignItems="center" columnGap={3}>
                  <Link href={params.user_type === UserType.INTERNAL_USER ? `/?token=${token}` : `/client?token=${token}`}>
                    <SecondaryBtn buttonContent={<StyledTypography variant="sm">Tasks</StyledTypography>} enableBackground />
                  </Link>
                  <StyledKeyboardIcon />
                  <Typography variant="sm">{params.task_id.toLocaleUpperCase()}</Typography>
                </Stack>
                {params.user_type === UserType.INTERNAL_USER && <MenuBoxContainer />}
              </Stack>
            </AppMargin>
          </StyledBox>
          <AppMargin size={SizeofAppMargin.LARGE} py="30px">
            <TaskEditor
              attachment={attachments}
              title={task?.title || ''}
              task_id={task_id}
              detail={task.body || ''}
              isEditable={params.user_type === UserType.INTERNAL_USER}
              updateTaskDetail={async (title, detail) => {
                'use server'
                await updateTaskDetail(token, task_id, title, detail)
              }}
              deleteTask={async () => {
                'use server'
                await deleteTask(token, task_id)
              }}
              postAttachment={async (postAttachmentPayload) => {
                'use server'
                await postAttachment(token, postAttachmentPayload)
              }}
              deleteAttachment={async (id: string) => {
                'use server'
                await deleteAttachment(token, id)
              }}
            />
          </AppMargin>
        </Box>
        <Box>
          <Sidebar
            assignee={assignee}
            selectedAssigneeId={task?.assigneeId}
            selectedWorkflowState={task.workflowState}
            updateWorkflowState={async (workflowState) => {
              'use server'
              await updateWorkflowStateIdOfTask(token, task_id, workflowState?.id)
            }}
            updateAssignee={async (assigneeType, assigneeId) => {
              'use server'
              await updateAssignee(token, task_id, assigneeType, assigneeId)
            }}
            disabled={params.user_type === UserType.CLIENT_USER}
          />
        </Box>
      </Stack>
    </ClientSideStateUpdate>
  )
}
