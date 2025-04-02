export const fetchCache = 'force-no-store'

import { AssigneeFetcher } from '@/app/_fetchers/AssigneeFetcher'
import { TemplatesFetcher } from '@/app/_fetchers/TemplatesFetcher'
import { ValidateNotificationCountFetcher } from '@/app/_fetchers/ValidateNotificationCountFetcher'
import { createMultipleAttachments } from '@/app/actions'
import { getViewSettings } from '@/app/page'
import { ModalNewTaskForm } from '@/app/ui/Modal_NewTaskForm'
import { TaskBoard } from '@/app/ui/TaskBoard'
import { TaskBoardAppBridge } from '@/app/ui/TaskBoardAppBridge'
import { SilentError } from '@/components/templates/SilentError'
import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { DndWrapper } from '@/hoc/DndWrapper'
import { RealTime } from '@/hoc/RealTime'
import { Token, TokenSchema, WorkspaceResponse } from '@/types/common'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { UserType } from '@/types/interfaces'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { getPreviewMode } from '@/utils/previewMode'
import { redirectIfTaskCta } from '@/utils/redirect'
import { UserRole } from '@api/core/types/user'
import { z } from 'zod'

import { Suspense } from 'react'
import { Task } from '@prisma/client'

async function getAllWorkflowStates(token: string): Promise<WorkflowStateResponse[]> {
  const res = await fetch(`${apiUrl}/api/workflow-states?token=${token}`, {
    next: { tags: ['getAllWorkflowStates'] },
  })

  const data = await res.json()

  return data.workflowStates
}

async function getAllTasks(token: string, accessibleTasks: Pick<Task, 'id' | 'parentId'>[]): Promise<TaskResponse[]> {
  const res = await fetch(`${apiUrl}/api/tasks?token=${token}`, {
    next: { tags: ['getAllTasks-client'] },
  })

  const data = await res.json()
  const allTasks = data.tasks.map((task: TaskResponse) => {
    return {
      ...task,
      subtaskCount: accessibleTasks.filter((subTask) => subTask.parentId === task.id).length,
    }
  })

  return allTasks
}

async function getTokenPayload(token: string): Promise<Token> {
  const copilotClient = new CopilotAPI(token)
  const payload = TokenSchema.parse(await copilotClient.getTokenPayload())
  return payload as Token
}

async function getWorkspace(token: string): Promise<WorkspaceResponse> {
  const copilot = new CopilotAPI(token)
  return await copilot.getWorkspace()
}

async function getAccessibleTaskIds(token: string) {
  const res = await fetch(`${apiUrl}/api/tasks/all?token=${token}`)

  const data = await res.json()

  return data.taskIds
}

export default async function ClientPage({ searchParams }: { searchParams: { token: string } }) {
  const token = searchParams.token
  if (!z.string().safeParse(token).success) {
    return <SilentError message="Please provide a Valid Token" />
  }
  redirectIfTaskCta(searchParams, UserType.CLIENT_USER)
  const accessibleTasks = await getAccessibleTaskIds(token)
  const [workflowStates, tasks, viewSettings, tokenPayload, workspace] = await Promise.all([
    await getAllWorkflowStates(token),
    await getAllTasks(token, accessibleTasks),
    getViewSettings(token),
    getTokenPayload(token),
    getWorkspace(token),
  ])

  const previewMode = getPreviewMode(tokenPayload)

  console.info(`app/client/page.tsx | Serving user ${token} with payload`, tokenPayload)

  return (
    <>
      <Suspense>{!previewMode && <ValidateNotificationCountFetcher token={token} />}</Suspense>
      <ClientSideStateUpdate
        workflowStates={workflowStates}
        tasks={tasks}
        token={token}
        tokenPayload={tokenPayload}
        viewSettings={viewSettings}
        clearExpandedComments={true}
        accessibleTasks={accessibleTasks}
      >
        <Suspense fallback={null}>
          <AssigneeFetcher
            token={token}
            userType={previewMode ? UserType.INTERNAL_USER : UserType.CLIENT_USER}
            isPreview={!!getPreviewMode(tokenPayload)}
          />
        </Suspense>
        <Suspense fallback={null}>
          <TemplatesFetcher token={token} />
        </Suspense>
        <TaskBoardAppBridge token={token} role={UserRole.Client} portalUrl={workspace.portalUrl} />
        <RealTime tokenPayload={tokenPayload}>
          <DndWrapper>
            <TaskBoard mode={UserRole.Client} />
          </DndWrapper>
          <ModalNewTaskForm
            handleCreateMultipleAttachments={async (attachments: CreateAttachmentRequest[]) => {
              'use server'
              await createMultipleAttachments(token, attachments)
            }}
          />
        </RealTime>
      </ClientSideStateUpdate>
    </>
  )
}
