export const fetchCache = 'force-no-store'

import { apiUrl } from '@/config'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { ReactNode } from 'react'
import { TaskResponse } from '@/types/dto/tasks.dto'

interface Props {
  token: string
  children: ReactNode
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
