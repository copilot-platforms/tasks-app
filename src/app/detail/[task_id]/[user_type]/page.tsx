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
  TaskDetailsContainer,
} from '@/app/detail/ui/styledComponent'
import {
  clientUpdateTask,
  deleteAttachment,
  deleteTask,
  postAttachment,
  postScrapImage,
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
import { DetailStateUpdate } from '@/app/detail/[task_id]/[user_type]/DetailStateUpdate'
import { SilentError } from '@/components/templates/SilentError'
import { z } from 'zod'
import { ScrapImageRequest } from '@/types/common'
import { signedUrlTtl } from '@/types/constants'
import { getActivityLogsForTask } from '@/app/api/activity-logs/activityLogs.controller'
import { ActivityLogsResponseSchema, ActivityLogsResponse } from '@/types/dto/activity.dto'
import { ActivityLogsService } from '@/app/api/activity-logs/activityLogs.service'
import { ActivityLog } from '../../ui/ActivityLog'

async function getOneTask(token: string, taskId: string): Promise<TaskResponse> {
  const res = await fetch(`${apiUrl}/api/tasks/${taskId}?token=${token}`, {
    next: { tags: ['getOneTask'], revalidate: signedUrlTtl },
  })

  const data = await res.json()

  return data.task
}

async function getSignedUrlFile(token: string, filePath: string) {
  'use server'
  const res = await fetch(`${apiUrl}/api/attachments/sign-url?token=${token}&filePath=${filePath}`)
  const data = await res.json()
  return data.signedUrl
}

const getActivityLogs = async (token: string, taskId: string) => {
  'use server'
  const res = await fetch(`${apiUrl}/api/tasks/${taskId}/activity-logs?token=${token}`)
  const parsedRes = ActivityLogsResponseSchema.parse(await res.json())
  return parsedRes.data
}

export default async function TaskDetailPage({
  params,
  searchParams,
}: {
  params: { task_id: string; task_name: string; user_type: UserType }
  searchParams: { token: string; isRedirect?: string }
}) {
  const { token } = searchParams
  const { task_id, user_type } = params
  const activities = await getActivityLogs(token, task_id)

  if (z.string().safeParse(token).error) {
    return <SilentError message="Please provide a Valid Token" />
  }

  const copilotClient = new CopilotAPI(token)

  const [task, tokenPayload] = await Promise.all([getOneTask(token, task_id), copilotClient.getTokenPayload()])
  if (!tokenPayload) {
    throw new Error('Please provide a Valid Token')
  }

  console.info(`app/detail/${task_id}/${user_type}/page.tsx | Serving user ${token} with payload`, tokenPayload)

  redirectIfResourceNotFound(searchParams, task, !!tokenPayload.internalUserId)

  return (
    <DetailStateUpdate isRedirect={!!searchParams.isRedirect} token={token} tokenPayload={tokenPayload} task={task}>
      <RealTime>
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
              <TaskDetailsContainer
                sx={{
                  padding: { xs: '20px 33px 20px 20px', sm: '30px 33px 30px 20px' },
                }}
              >
                <StyledTiptapDescriptionWrapper>
                  <TaskEditor
                    // attachment={attachments}
                    task_id={task_id}
                    task={task}
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
                    userType={params.user_type}
                  />
                </StyledTiptapDescriptionWrapper>
                <AppMargin size={SizeofAppMargin.LARGE} py="18.5px">
                  <Stack direction="column" alignItems="left" p="10px 5px" rowGap={5}>
                    <Typography variant="xl">Activity</Typography>
                    <Stack direction="column" alignItems="left" p="10px 5px" rowGap={4}>
                      {activities.map((activity) => (
                        <ActivityLog key={activity.id} log={activity} />
                      ))}
                    </Stack>
                  </Stack>
                </AppMargin>
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
              </TaskDetailsContainer>
            </CustomScrollbar>
          </ToggleController>
          <Box>
            <Suspense fallback={<SidebarSkeleton />}>
              <WorkflowStateFetcher token={token}>
                <AssigneeFetcher token={token} userType={params.user_type} />
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
    </DetailStateUpdate>
  )
}
