export const fetchCache = 'force-no-store'

import { AssigneeFetcher } from '@/app/_fetchers/AssigneeFetcher'
import { WorkflowStateFetcher } from '@/app/_fetchers/WorkflowStateFetcher'
import { UserRole } from '@/app/api/core/types/user'
import {
  clientUpdateTask,
  deleteAttachment,
  deleteTask,
  postAttachment,
  updateAssignee,
  updateTaskDetail,
  updateWorkflowStateIdOfTask,
} from '@/app/detail/[task_id]/[user_type]/actions'
import { DetailStateUpdate } from '@/app/detail/[task_id]/[user_type]/DetailStateUpdate'
import { ActivityWrapper } from '@/app/detail/ui/ActivityWrapper'
import { ArchiveWrapper } from '@/app/detail/ui/ArchiveWrapper'
import { LastArchivedField } from '@/app/detail/ui/LastArchiveField'
import { MenuBoxContainer } from '@/app/detail/ui/MenuBoxContainer'
import { ResponsiveStack } from '@/app/detail/ui/ResponsiveStack'
import { Sidebar, SidebarSkeleton } from '@/app/detail/ui/Sidebar'
import { StyledBox, StyledTiptapDescriptionWrapper, TaskDetailsContainer } from '@/app/detail/ui/styledComponent'
import { TaskEditor } from '@/app/detail/ui/TaskEditor'
import { ToggleButtonContainer } from '@/app/detail/ui/ToggleButtonContainer'
import { ToggleController } from '@/app/detail/ui/ToggleController'
import { DeletedTaskRedirectPage } from '@/components/layouts/DeletedTaskRedirectPage'
import { HeaderBreadcrumbs } from '@/components/layouts/HeaderBreadcrumbs'
import { SilentError } from '@/components/templates/SilentError'
import { apiUrl } from '@/config'
import { signedUrlTtl } from '@/constants/attachments'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import CustomScrollBar from '@/hoc/CustomScrollBar'
import { RealTime } from '@/hoc/RealTime'
import { WorkspaceResponse } from '@/types/common'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { UserType } from '@/types/interfaces'
import { CopilotAPI } from '@/utils/CopilotAPI'
import EscapeHandler from '@/utils/escapeHandler'
import { getPreviewMode } from '@/utils/previewMode'
import { Box, Stack } from '@mui/material'
import { Suspense } from 'react'
import { z } from 'zod'

async function getOneTask(token: string, taskId: string): Promise<TaskResponse> {
  const res = await fetch(`${apiUrl}/api/tasks/${taskId}?token=${token}`, {
    next: { tags: ['getOneTask'], revalidate: signedUrlTtl },
  })

  const data = await res.json()

  return data.task
}

async function getWorkspace(token: string): Promise<WorkspaceResponse> {
  const copilot = new CopilotAPI(token)
  return await copilot.getWorkspace()
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

  if (z.string().safeParse(token).error) {
    return <SilentError message="Please provide a Valid Token" />
  }

  const copilotClient = new CopilotAPI(token)

  const [task, tokenPayload, workspace] = await Promise.all([
    getOneTask(token, task_id),
    copilotClient.getTokenPayload(),
    getWorkspace(token),
  ])

  if (!tokenPayload) {
    throw new Error('Please provide a Valid Token')
  }

  console.info(`app/detail/${task_id}/${user_type}/page.tsx | Serving user ${token} with payload`, tokenPayload)
  if (!task) {
    return <DeletedTaskRedirectPage userType={tokenPayload.internalUserId ? UserRole.IU : UserRole.Client} token={token} />
  }

  const isPreviewMode = !!getPreviewMode(tokenPayload)

  return (
    <DetailStateUpdate isRedirect={!!searchParams.isRedirect} token={token} tokenPayload={tokenPayload} task={task}>
      <RealTime tokenPayload={tokenPayload}>
        <EscapeHandler />
        <ResponsiveStack>
          <ToggleController>
            {isPreviewMode ? (
              <StyledBox>
                <AppMargin size={SizeofAppMargin.HEADER} py="17.5px">
                  <Stack direction="row" justifyContent="space-between">
                    <HeaderBreadcrumbs token={token} title={task?.label} userType={params.user_type} />
                    <Stack direction="row" alignItems="center" columnGap="8px">
                      <MenuBoxContainer role={tokenPayload.internalUserId ? UserRole.IU : UserRole.Client} />
                      <Stack direction="row" alignItems="center" columnGap="8px">
                        <ArchiveWrapper taskId={task_id} userType={user_type} />
                      </Stack>
                    </Stack>
                  </Stack>
                </AppMargin>
              </StyledBox>
            ) : (
              <>
                <HeaderBreadcrumbs
                  token={token}
                  title={task?.label}
                  userType={params.user_type}
                  portalUrl={workspace.portalUrl}
                />
                <ArchiveWrapper taskId={task_id} userType={user_type} />
              </>
            )}

            <CustomScrollBar>
              <TaskDetailsContainer
                sx={{
                  padding: { xs: '20px 33px 20px 20px', sm: '30px 33px 30px 20px' },
                }}
              >
                <StyledTiptapDescriptionWrapper>
                  <LastArchivedField />
                  <TaskEditor
                    // attachment={attachments}
                    task_id={task_id}
                    task={task}
                    isEditable={params.user_type === UserType.INTERNAL_USER || !!getPreviewMode(tokenPayload)}
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

                <ActivityWrapper task_id={task_id} token={token} tokenPayload={tokenPayload} />
              </TaskDetailsContainer>
            </CustomScrollBar>
          </ToggleController>
          <Box>
            <Suspense fallback={<SidebarSkeleton />}>
              <WorkflowStateFetcher token={token}>
                <AssigneeFetcher token={token} userType={params.user_type} isPreview={!!getPreviewMode(tokenPayload)} />
                <Sidebar
                  task_id={task_id}
                  selectedAssigneeId={task?.assigneeId}
                  selectedWorkflowState={task?.workflowState}
                  updateWorkflowState={async (workflowState) => {
                    'use server'
                    params.user_type === UserType.CLIENT_USER && !getPreviewMode(tokenPayload)
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
        </ResponsiveStack>
      </RealTime>
    </DetailStateUpdate>
  )
}
