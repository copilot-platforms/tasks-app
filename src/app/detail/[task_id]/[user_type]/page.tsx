export const fetchCache = 'force-no-store'

import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TaskEditor } from '@/app/detail/ui/TaskEditor'
import { Box, Stack, Typography } from '@mui/material'
import { Sidebar, SidebarSkeleton } from '@/app/detail/ui/Sidebar'
import { UserType } from '@/types/interfaces'
import { apiUrl } from '@/config'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import {
  StyledBox,
  StyledKeyboardIcon,
  StyledTiptapDescriptionWrapper,
  StyledTypography,
} from '@/app/detail/ui/styledComponent'
import Link from 'next/link'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import {
  clientUpdateTask,
  deleteAttachment,
  deleteTask,
  postAttachment,
  updateAssignee,
  updateTaskDetail,
} from '@/app/detail/[task_id]/[user_type]/actions'
import { updateWorkflowStateIdOfTask } from '@/app/detail/[task_id]/[user_type]/actions'
import { MenuBoxContainer } from '@/app/detail/ui/MenuBoxContainer'
import { ToggleButtonContainer } from '@/app/detail/ui/ToggleButtonContainer'
import { ToggleController } from '@/app/detail/ui/ToggleController'
import { CopilotAPI } from '@/utils/CopilotAPI'
import EscapeHandler from '@/utils/escapeHandler'
import { RealTime } from '@/hoc/RealTime'
import { CustomScrollbar } from '@/hoc/CustomScrollbar'
import { redirectIfResourceNotFound } from '@/utils/redirect'
import { Suspense } from 'react'
import { WorkflowStateFetcher } from '@/app/_fetchers/WorkflowStateFetcher'
import { AssigneeFetcher } from '@/app/_fetchers/AssigneeFetcher'
import { CustomLink } from '@/hoc/CustomLink'
import { TasksFetcher } from '@/app/_fetchers/TasksFetcher'

async function getOneTask(token: string, taskId: string): Promise<TaskResponse> {
  const res = await fetch(`${apiUrl}/api/tasks/${taskId}?token=${token}`, {
    next: { tags: ['getOneTask'] },
  })

  const data = await res.json()

  return data.task
}

async function getSignedUrlUpload(token: string, fileName: string) {
  const res = await fetch(`${apiUrl}/api/attachments/upload?token=${token}&fileName=${fileName}`)
  const data = await res.json()
  return data.signedUrl
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
  const copilotClient = new CopilotAPI(token)

  const [task, tokenPayload] = await Promise.all([getOneTask(token, task_id), copilotClient.getTokenPayload()])

  // Basic validation
  if (!tokenPayload) {
    throw new Error('Token cannot be found')
  }

  redirectIfResourceNotFound(searchParams, task, !!tokenPayload.internalUserId)

  return (
    <ClientSideStateUpdate token={token} tokenPayload={tokenPayload}>
      <RealTime>
        <Suspense fallback={null}>
          <TasksFetcher token={token} />
        </Suspense>
        <EscapeHandler />
        <Stack direction="row" sx={{ height: '100vh' }}>
          <ToggleController>
            <StyledBox>
              <AppMargin size={SizeofAppMargin.LARGE} py="16px">
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" columnGap={3}>
                    <CustomLink
                      href={{ pathname: params.user_type === UserType.INTERNAL_USER ? `/` : `/client`, query: { token } }}
                    >
                      <SecondaryBtn
                        buttonContent={
                          <StyledTypography variant="sm" lineHeight={'21px'}>
                            Tasks
                          </StyledTypography>
                        }
                        variant="breadcrumb"
                      />
                    </CustomLink>
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
                    // attachment={attachments}
                    task_id={task_id}
                    isEditable={params.user_type === UserType.INTERNAL_USER}
                    updateTaskDetail={async (detail) => {
                      'use server'
                      await updateTaskDetail({ token, taskId: task_id, payload: { body: detail } })
                    }}
                    updateTaskTitle={async (title) => {
                      'use server'
                      title.trim() != '' && (await updateTaskDetail({ token, taskId: task_id, payload: { title } }))
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
              {/* {advancedFeatureFlag && ( */}
              {/*   <AppMargin size={SizeofAppMargin.LARGE} py="18.5px"> */}
              {/*     <Stack direction="column" alignItems="left" p="10px 5px" rowGap={5}> */}
              {/*       <Typography variant="xl">Activity</Typography> */}
              {/*       <Stack direction="column" alignItems="left" p="10px 5px" rowGap={4}> */}
              {/*         {activities?.map((item: LogResponse, index: number) => { */}
              {/*           return ( */}
              {/*             <Box */}
              {/*               sx={{ */}
              {/*                 height: 'auto', */}
              {/*                 display: 'block', */}
              {/*               }} */}
              {/*               key={item.id} */}
              {/*             > */}
              {/*               {item.type == ActivityType.COMMENT_ADDED ? ( */}
              {/*                 <Comments */}
              {/*                   comment={item} */}
              {/*                   createComment={async (postCommentPayload: CreateComment) => { */}
              {/*                     'use server' */}
              {/*                     await postComment(token, postCommentPayload) */}
              {/*                   }} */}
              {/*                   deleteComment={async (id: string) => { */}
              {/*                     'use server' */}
              {/*                     await deleteComment(token, id) */}
              {/*                   }} */}
              {/*                   task_id={task_id} */}
              {/*                 /> */}
              {/*               ) : ( */}
              {/*                 <ActivityLog log={item} /> */}
              {/*               )} */}
              {/*             </Box> */}
              {/*           ) */}
              {/*         })} */}

              {/*         <CommentInput */}
              {/*           createComment={async (postCommentPayload: CreateComment) => { */}
              {/*             'use server' */}
              {/*             await postComment(token, postCommentPayload) */}
              {/*           }} */}
              {/*           task_id={task_id} */}
              {/*         /> */}
              {/*       </Stack> */}
              {/*     </Stack> */}
              {/*   </AppMargin> */}
              {/* )} */}
            </CustomScrollbar>
          </ToggleController>
          <Box>
            <Suspense fallback={<SidebarSkeleton />}>
              <WorkflowStateFetcher token={token}>
                <AssigneeFetcher token={token} />
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
              </WorkflowStateFetcher>
            </Suspense>
          </Box>
        </Stack>
      </RealTime>
    </ClientSideStateUpdate>
  )
}
