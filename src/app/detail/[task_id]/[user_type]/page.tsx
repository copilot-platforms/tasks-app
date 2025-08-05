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
import { Subtasks } from '@/app/detail/ui/Subtasks'
import { TaskEditor } from '@/app/detail/ui/TaskEditor'
import { ToggleController } from '@/app/detail/ui/ToggleController'
import { DeletedTaskRedirectPage } from '@/components/layouts/DeletedTaskRedirectPage'
import { HeaderBreadcrumbs } from '@/components/layouts/HeaderBreadcrumbs'
import { SilentError } from '@/components/templates/SilentError'
import { apiUrl } from '@/config'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import CustomScrollBar from '@/hoc/CustomScrollBar'
import { RealTime } from '@/hoc/RealTime'
import { WorkspaceResponse } from '@/types/common'
import { AncestorTaskResponse, SubTaskStatusResponse, TaskResponse } from '@/types/dto/tasks.dto'
import { UserType } from '@/types/interfaces'
import { getAssigneeCacheLookupKey, UserIdsType } from '@/utils/assignee'
import { CopilotAPI } from '@/utils/CopilotAPI'
import EscapeHandler from '@/utils/escapeHandler'
import { getPreviewMode } from '@/utils/previewMode'
import { Box, Stack } from '@mui/material'
import { z } from 'zod'
import { fetchWithErrorHandler } from '@/app/_fetchers/fetchWithErrorHandler'
import { AssigneeCacheGetter } from '@/app/_cache/AssigneeCacheGetter'
import { ClientDetailAppBridge } from '@/app/detail/ui/ClientDetailAppBridge'

async function getOneTask(token: string, taskId: string): Promise<TaskResponse> {
  const data = await fetchWithErrorHandler<{ task: TaskResponse }>(`${apiUrl}/api/tasks/${taskId}?token=${token}`, {
    cache: 'no-store',
    next: { tags: ['getOneTask'] },
  })

  return data.task
}

async function getWorkspace(token: string): Promise<WorkspaceResponse> {
  const copilot = new CopilotAPI(token)
  return await copilot.getWorkspace()
}

async function getSubTasksStatus(token: string, taskId: string): Promise<SubTaskStatusResponse> {
  const res = await fetch(`${apiUrl}/api/tasks/${taskId}/subtask-count?token=${token}`, {})
  const data = await res.json()
  return data
}

async function getTaskPath(token: string, taskId: string): Promise<AncestorTaskResponse[]> {
  const res = await fetch(`${apiUrl}/api/tasks/${taskId}/path?token=${token}`)
  const { path } = await res.json()
  return path
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

  const [task, tokenPayload, workspace, subTaskStatus, taskPath] = await Promise.all([
    getOneTask(token, task_id),
    copilotClient.getTokenPayload(),
    getWorkspace(token),
    getSubTasksStatus(token, task_id),
    getTaskPath(token, task_id),
  ])

  if (!tokenPayload) {
    throw new Error('Please provide a Valid Token')
  }

  console.info(`app/detail/${task_id}/${user_type}/page.tsx | Serving user ${token} with payload`, tokenPayload)
  if (!task) {
    return <DeletedTaskRedirectPage userType={tokenPayload.companyId ? UserRole.Client : UserRole.IU} token={token} />
  }

  const isPreviewMode = !!getPreviewMode(tokenPayload)

  const breadcrumbItems: { label: string; href: string }[] = taskPath.map(({ label, id }) => ({
    label,
    href: `/detail/${id}/${user_type}?token=${token}`,
  }))

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
                    <HeaderBreadcrumbs token={token} items={breadcrumbItems} userType={params.user_type} />
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
                  items={breadcrumbItems}
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
                {subTaskStatus.canCreateSubtask && (
                  <Subtasks
                    task_id={task_id}
                    token={token}
                    userType={tokenPayload.internalUserId ? UserRole.IU : UserRole.Client}
                    canCreateSubtasks={params.user_type === UserType.INTERNAL_USER || !!getPreviewMode(tokenPayload)}
                  />
                )}

                <ActivityWrapper task_id={task_id} token={token} tokenPayload={tokenPayload} />
              </TaskDetailsContainer>
            </CustomScrollBar>
          </ToggleController>
          <Box>
            <AssigneeCacheGetter lookupKey={getAssigneeCacheLookupKey(user_type, tokenPayload)} />
            <AssigneeFetcher
              token={token}
              userType={params.user_type}
              isPreview={!!getPreviewMode(tokenPayload)}
              task={task}
              tokenPayload={tokenPayload}
            />
            <WorkflowStateFetcher token={token} task={task} />
            <Sidebar
              task_id={task_id}
              selectedAssigneeId={task?.assigneeId}
              userType={user_type}
              portalUrl={workspace.portalUrl}
              selectedWorkflowState={task?.workflowState}
              updateWorkflowState={async (workflowState) => {
                'use server'
                params.user_type === UserType.CLIENT_USER && !getPreviewMode(tokenPayload)
                  ? await clientUpdateTask(token, task_id, workflowState.id)
                  : await updateWorkflowStateIdOfTask(token, task_id, workflowState?.id)
              }}
              updateAssignee={async ({ internalUserId, clientId, companyId }: UserIdsType) => {
                'use server'
                await updateAssignee(token, task_id, internalUserId, clientId, companyId)
              }}
              updateTask={async (payload) => {
                'use server'
                await updateTaskDetail({ token, taskId: task_id, payload })
              }}
              disabled={params.user_type === UserType.CLIENT_USER}
            />
          </Box>
        </ResponsiveStack>
      </RealTime>
    </DetailStateUpdate>
  )
}
