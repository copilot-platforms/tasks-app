export const fetchCache = 'force-no-store'

import { AllTasksFetcher } from '@/app/_fetchers/AllTasksFetcher'
import { AssigneeFetcher } from '@/app/_fetchers/AssigneeFetcher'
import { TemplatesFetcher } from '@/app/_fetchers/TemplatesFetcher'
import { createMultipleAttachments } from '@/app/(home)/actions'
import { ModalNewTaskForm } from '@/app/ui/Modal_NewTaskForm'
import { TaskBoard } from '@/app/ui/TaskBoard'
import { SilentError } from '@/components/templates/SilentError'
import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { DndWrapper } from '@/hoc/DndWrapper'
import { RealTime } from '@/hoc/RealTime'
import { Token, TokenSchema, WorkspaceResponse } from '@/types/common'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { UserType } from '@/types/interfaces'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { redirectIfTaskCta, redirectToClientPortal } from '@/utils/redirect'
import { UserRole } from '@api/core/types/user'
import { Suspense } from 'react'
import { z } from 'zod'
import { fetchWithErrorHandler } from '@/app/_fetchers/fetchWithErrorHandler'

export async function getAllWorkflowStates(token: string): Promise<WorkflowStateResponse[]> {
  const res = await fetch(`${apiUrl}/api/workflow-states?token=${token}`, {
    next: { tags: ['getAllWorkflowStates'] },
  })

  const data = await res.json()
  return data.workflowStates
}

export async function getAllTasks(
  token: string,
  filters?: { showArchived?: boolean; showUnarchived?: boolean },
): Promise<TaskResponse[]> {
  const queryParams = new URLSearchParams({ token })
  if (filters?.showArchived !== undefined) {
    queryParams.append('showArchived', filters.showArchived.toString())
  }
  if (filters?.showUnarchived !== undefined) {
    queryParams.append('showUnarchived', filters.showUnarchived.toString())
  }
  const data = await fetchWithErrorHandler<{ tasks: TaskResponse[] }>(`${apiUrl}/api/tasks?${queryParams.toString()}`, {
    next: { tags: ['getTasks'] },
  })

  return data.tasks
}

export async function getTokenPayload(token: string): Promise<Token> {
  const copilotClient = new CopilotAPI(token)
  const payload = TokenSchema.parse(await copilotClient.getTokenPayload())
  return payload as Token
}

export async function getWorkspace(token: string): Promise<WorkspaceResponse> {
  const copilot = new CopilotAPI(token)
  return await copilot.getWorkspace()
}

export async function getViewSettings(token: string): Promise<CreateViewSettingsDTO> {
  const res = await fetch(`${apiUrl}/api/view-settings?token=${token}`, {
    next: { tags: ['getViewSettings'] },
  })
  const resp = await res.json()
  return resp
}

async function getAccessibleTasks(token: string) {
  const res = await fetch(`${apiUrl}/api/tasks?token=${token}&all=1`)

  const data = await res.json()
  return data.tasks
}

export default async function Main({ searchParams }: { searchParams: { token: string; taskId?: string } }) {
  const token = searchParams.token

  const parsedToken = z.string().safeParse(searchParams.token)
  if (!parsedToken.success) {
    return <SilentError message="Please provide a Valid Token" />
  }

  const tokenPayload = await getTokenPayload(token)
  const userRole = tokenPayload.internalUserId ? UserType.INTERNAL_USER : tokenPayload.clientId ? UserType.CLIENT_USER : null
  if (!userRole) {
    return <SilentError message="Please provide a Valid Token" />
  }
  // Both clients and IUs can access this page so hardcoding a UserRole will not work
  redirectIfTaskCta(searchParams, userRole)

  const viewSettings = await getViewSettings(token)
  const [workflowStates, tasks, workspace] = await Promise.all([
    getAllWorkflowStates(token),
    getAllTasks(token, { showArchived: viewSettings.showArchived, showUnarchived: viewSettings.showUnarchived }),
    getWorkspace(token),
  ])

  if (tokenPayload.companyId) {
    redirectToClientPortal(token)
  }

  console.info(`app/page.tsx | Serving user ${token} with payload`, tokenPayload)
  return (
    <ClientSideStateUpdate
      workflowStates={workflowStates}
      tasks={tasks}
      token={token}
      viewSettings={viewSettings}
      tokenPayload={tokenPayload}
      clearExpandedComments={true}
    >
      {/* Async fetchers */}
      <Suspense fallback={null}>
        <AssigneeFetcher token={token} viewSettings={viewSettings} />
      </Suspense>
      <Suspense fallback={null}>
        <TemplatesFetcher token={token} />
      </Suspense>
      <Suspense fallback={null}>
        <AllTasksFetcher token={token} />
      </Suspense>

      <RealTime tokenPayload={tokenPayload}>
        <DndWrapper>
          <TaskBoard mode={UserRole.IU} workspace={workspace} />
        </DndWrapper>
        <ModalNewTaskForm
          handleCreateMultipleAttachments={async (attachments: CreateAttachmentRequest[]) => {
            'use server'
            await createMultipleAttachments(token, attachments)
          }}
        />
      </RealTime>
    </ClientSideStateUpdate>
  )
}
