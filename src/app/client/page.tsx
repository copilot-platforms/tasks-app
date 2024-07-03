export const fetchCache = 'force-no-store'

import { Header } from '@/components/layouts/Header'
import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssignee, IAssigneeCombined } from '@/types/interfaces'
import { addTypeToAssignee } from '@/utils/addTypeToAssignee'
import { ClientTaskBoard } from './ui/ClientTaskBoard'
import { completeTask } from '@/app/client/actions'

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

async function getAssigneeList(token: string): Promise<IAssignee> {
  const res = await fetch(`${apiUrl}/api/users?token=${token}`, {
    next: { tags: ['getAssigneeList'] },
  })
  const data = await res.json()
  return data.users
}

export default async function ClientPage({ searchParams }: { searchParams: { token: string } }) {
  const token = searchParams.token

  const [workflowStates, tasks, assignee] = await Promise.all([
    await getAllWorkflowStates(token),
    await getAllTasks(token),
    addTypeToAssignee(await getAssigneeList(token)),
  ])
  return (
    <>
      <ClientSideStateUpdate workflowStates={workflowStates} tasks={tasks} token={token} assignee={assignee}>
        <Header showCreateTaskButton={false} />
        <ClientTaskBoard
          completeTask={async (taskId) => {
            'use server'
            completeTask({ token, taskId })
          }}
        />
      </ClientSideStateUpdate>
    </>
  )
}
