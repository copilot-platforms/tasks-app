export const fetchCache = 'force-no-store'

import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TaskEditor } from '@/app/detail/ui/TaskEditor'
import { Box, Stack, Typography } from '@mui/material'
import { Sidebar } from '@/app/detail/ui/Sidebar'
import { IAssignee, UserType } from '@/types/interfaces'
import { advancedFeatureFlag, apiUrl } from '@/config'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import {
  StyledBox,
  StyledKeyboardIcon,
  StyledTiptapDescriptionWrapper,
  StyledTypography,
} from '@/app/detail/ui/styledComponent'
import Link from 'next/link'
import {
  clientUpdateTask,
  deleteAttachment,
  deleteComment,
  deleteTask,
  postAttachment,
  postComment,
  updateAssignee,
  updateTaskDetail,
} from '@/app/detail/[task_id]/[user_type]/actions'
import { updateWorkflowStateIdOfTask } from '@/app/detail/[task_id]/[user_type]/actions'
import { MenuBoxContainer } from '@/app/detail/ui/MenuBoxContainer'
import { ToggleButtonContainer } from '@/app/detail/ui/ToggleButtonContainer'
import { ToggleController } from '@/app/detail/ui/ToggleController'
import { AttachmentResponseSchema } from '@/types/dto/attachments.dto'
import { ActivityLog } from '@/app/detail/ui/ActivityLog'
import { Comments } from '@/app/detail/ui/Comments'
import { CommentInput } from '@/components/inputs/CommentInput'
import { LogResponse } from '@/app/api/activity-logs/schemas/LogResponseSchema'
import { ActivityType } from '@prisma/client'
import { CreateComment } from '@/types/dto/comment.dto'
import EscapeHandler from '@/utils/escapeHandler'
import { CustomScrollbar } from '@/hoc/CustomScrollbar'
import { redirectIfResourceNotFound } from '@/utils/redirect'

async function getOneTask(token: string, taskId: string): Promise<TaskResponse> {
  const res = await fetch(`${apiUrl}/api/tasks/${taskId}?token=${token}`, {
    next: { tags: ['getOneTask'] },
  })

  const data = await res.json()

  return data.task
}

async function getAttachments(token: string, taskId: string): Promise<AttachmentResponseSchema[]> {
  const res = await fetch(`${apiUrl}/api/attachments/?taskId=${taskId}&token=${token}`, {
    next: { tags: ['getAttachments'] },
  })
  const data = await res.json()

  return data.attachments
}

async function getSignedUrlUpload(token: string, fileName: string) {
  const res = await fetch(`${apiUrl}/api/attachments/upload?token=${token}&fileName=${fileName}`)
  const data = await res.json()
  return data.signedUrl
}

async function getActivities(token: string, taskId: string): Promise<LogResponse[]> {
  const res = await fetch(`${apiUrl}/api/tasks/${taskId}/activity-logs/?token=${token}`)
  const data = await res.json()
  return data.data
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

  const [task, attachments, activities] = await Promise.all([
    getOneTask(token, task_id),
    getAttachments(token, task_id),
    getActivities(token, task_id),
  ])

  redirectIfResourceNotFound(searchParams, task, params.user_type === UserType.INTERNAL_USER)

  return (
    <>
      <EscapeHandler />
      <Stack direction="row" sx={{ height: '100vh' }}>
        <ToggleController>
          <StyledBox>
            <AppMargin size={SizeofAppMargin.LARGE} py="16px">
              <Stack direction="row" justifyContent="space-between">
                <Stack direction="row" alignItems="center" columnGap={3}>
                  <Link href={params.user_type === UserType.INTERNAL_USER ? `/?token=${token}` : `/client?token=${token}`}>
                    <SecondaryBtn
                      buttonContent={
                        <StyledTypography variant="sm" lineHeight={'21px'}>
                          Tasks
                        </StyledTypography>
                      }
                      variant="breadcrumb"
                    />
                  </Link>
                  <StyledKeyboardIcon />
                  <Typography variant="sm">{task?.label}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" columnGap="8px">
                  {params.user_type === UserType.INTERNAL_USER && <MenuBoxContainer />}
                  <ToggleButtonContainer />
                </Stack>
              </Stack>
            </AppMargin>
          </StyledBox>
          <CustomScrollbar style={{ width: '8px' }}>
            <StyledTiptapDescriptionWrapper>
              <AppMargin size={SizeofAppMargin.LARGE} py="30px">
                <TaskEditor
                  attachment={attachments}
                  task_id={task_id}
                  isEditable={params.user_type === UserType.INTERNAL_USER}
                  updateTaskDetail={async (detail) => {
                    'use server'
                    await updateTaskDetail({ token, taskId: task_id, payload: { body: detail } })
                  }}
                  updateTaskTitle={async (title) => {
                    'use server'
                    await updateTaskDetail({ token, taskId: task_id, payload: { title } })
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
                  getSignedUrlUpload={async (fileName: string) => {
                    'use server'
                    const data = await getSignedUrlUpload(token, fileName)
                    return data
                  }}
                  userType={params.user_type}
                />
              </AppMargin>
            </StyledTiptapDescriptionWrapper>
            {advancedFeatureFlag && (
              <AppMargin size={SizeofAppMargin.LARGE} py="18.5px">
                <Stack direction="column" alignItems="left" p="10px 5px" rowGap={5}>
                  <Typography variant="xl">Activity</Typography>
                  <Stack direction="column" alignItems="left" p="10px 5px" rowGap={4}>
                    {activities?.map((item: LogResponse, index: number) => {
                      return (
                        <Box
                          sx={{
                            height: 'auto',
                            display: 'block',
                          }}
                          key={item.id}
                        >
                          {item.type == ActivityType.COMMENT_ADDED ? (
                            <Comments
                              comment={item}
                              createComment={async (postCommentPayload: CreateComment) => {
                                'use server'
                                await postComment(token, postCommentPayload)
                              }}
                              deleteComment={async (id: string) => {
                                'use server'
                                await deleteComment(token, id)
                              }}
                              task_id={task_id}
                            />
                          ) : (
                            <ActivityLog log={item} />
                          )}
                        </Box>
                      )
                    })}

                    <CommentInput
                      createComment={async (postCommentPayload: CreateComment) => {
                        'use server'
                        await postComment(token, postCommentPayload)
                      }}
                      task_id={task_id}
                    />
                  </Stack>
                </Stack>
              </AppMargin>
            )}
          </CustomScrollbar>
        </ToggleController>
        <Box>
          <Sidebar
            task_id={task_id}
            selectedAssigneeId={task?.assigneeId}
            selectedWorkflowState={task?.workflowState}
            updateWorkflowState={async (workflowState) => {
              'use server'
              params.user_type === UserType.CLIENT_USER
                ? await clientUpdateTask(token, task_id, workflowState.id)
                : await updateWorkflowStateIdOfTask(token, task_id, workflowState?.id)
            }}
            updateAssignee={async (assigneeType, assigneeId) => {
              'use server'
              await updateAssignee(token, task_id, assigneeType, assigneeId)
            }}
            updateTask={async (payload) => {
              'use server'
              await updateTaskDetail({ token, taskId: task_id, payload })
            }}
            disabled={params.user_type === UserType.CLIENT_USER}
          />
        </Box>
      </Stack>
    </>
  )
}
