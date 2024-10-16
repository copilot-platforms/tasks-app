export const fetchCache = 'force-no-store'

import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { UserType } from '@/types/interfaces'
import { RealTime } from '@/hoc/RealTime'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { Token, TokenSchema } from '@/types/common'
import { Suspense } from 'react'
import { AssigneeFetcher } from '@/app/_fetchers/AssigneeFetcher'
import { z } from 'zod'
import { SilentError } from '@/components/templates/SilentError'
import { TaskBoard } from '@/app/ui/TaskBoard'
import { DndWrapper } from '@/hoc/DndWrapper'
import { UserRole } from '@api/core/types/user'
import { getViewSettings } from '@/app/page'

async function getAllWorkflowStates(token: string): Promise<WorkflowStateResponse[]> {
  const res = await fetch(`${apiUrl}/api/workflow-states?token=${token}`, {
    next: { tags: ['getAllWorkflowStates'] },
  })

  const data = await res.json()

  return data.workflowStates
}

async function getAllTasks(token: string): Promise<TaskResponse[]> {
  const res = await fetch(`${apiUrl}/api/tasks?token=${token}`, {
    next: { tags: ['getAllTasks-client'] },
  })

  const data = await res.json()
  return data.tasks
}

async function getTokenPayload(token: string): Promise<Token> {
  const copilotClient = new CopilotAPI(token)
  const payload = TokenSchema.parse(await copilotClient.getTokenPayload())
  return payload as Token
}

export default async function ClientPage({ searchParams }: { searchParams: { token: string } }) {
  const token = searchParams.token
  if (!z.string().safeParse(token).success) {
    return <SilentError message="Please provide a Valid Token" />
  }

  const [workflowStates, tasks, viewSettings, tokenPayload] = await Promise.all([
    await getAllWorkflowStates(token),
    await getAllTasks(token),
    getViewSettings(token),
    getTokenPayload(token),
  ])

  console.info(`app/client/page.tsx | Serving user ${token} with payload`, tokenPayload)

  return (
    <>
      <ClientSideStateUpdate
        workflowStates={workflowStates}
        tasks={tasks}
        token={token}
        tokenPayload={tokenPayload}
        viewSettings={viewSettings}
      >
        <Suspense fallback={null}>
          <AssigneeFetcher token={token} userType={UserType.CLIENT_USER} />
        </Suspense>
        <RealTime>
          <DndWrapper>
            <TaskBoard mode={UserRole.Client} />
          </DndWrapper>
        </RealTime>
      </ClientSideStateUpdate>
    </>
  )
}
