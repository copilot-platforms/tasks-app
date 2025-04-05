export const fetchCache = 'force-no-store'

import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { PropsWithToken } from '@/types/interfaces'
import { PropsWithChildren } from 'react'

interface Props extends PropsWithToken, PropsWithChildren {
  task?: TaskResponse
}

const getAllWorkflowStates = async (token: string): Promise<WorkflowStateResponse[]> => {
  const res = await fetch(`${apiUrl}/api/workflow-states?token=${token}`, {
    next: { tags: ['getAllWorkflowStates'] },
  })

  const data = await res.json()

  return data.workflowStates
}

export const WorkflowStateFetcher = async ({ token, children, task }: Props) => {
  const workflowStates = await getAllWorkflowStates(token)

  return (
    <ClientSideStateUpdate workflowStates={workflowStates} task={task}>
      {children}
    </ClientSideStateUpdate>
  )
}
