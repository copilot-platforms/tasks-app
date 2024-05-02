export const dynamic = 'force-dynamic'
export const dynamicParams = true

import { DndWrapper } from '@/hoc/DndWrapper'
import { TaskBoard } from './ui/TaskBoard'
import { Header } from '@/components/layouts/Header'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { TaskResponse, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { IAssignee } from '@/types/interfaces'
import { addTypeToAssignee } from '@/utils/addTypeToAssignee'
import { handleCreate, updateTask, updateWorkflowStateIdOfTask } from './actions'

async function getAllWorkflowStates(token: string): Promise<WorkflowStateResponse[]> {
  const res = await fetch(`${apiUrl}/api/workflow-states?token=${token}`, {
    next: { tags: ['getAllWorkflowStates'] },
  })

  const data = await res.json()

  return data.workflowStates
}

async function getAllTasks(token: string): Promise<TaskResponse[]> {
  const res = await fetch(`${apiUrl}/api/tasks?token=${token}`, {
    next: { tags: ['getAllTasks'], revalidate: 0 },
  })

  const data = await res.json()

  return data.tasks
}

async function getAssigneeList(token: string): Promise<IAssignee> {
  const res = await fetch(`${apiUrl}/api/users?token=${token}`, {
    next: { tags: ['getAssigneeList'], revalidate: 0 },
  })

  const data = await res.json()

  return data.users
}

export default async function Main({ searchParams }: { searchParams: { token: string } }) {
  const token = searchParams.token

  if (!token) {
    throw new Error('Please pass the token!')
  }

  const workflowStates = await getAllWorkflowStates(token)
  const tasks = await getAllTasks(token)
  const assignee = addTypeToAssignee(await getAssigneeList(token))

  return (
    <>
      <ClientSideStateUpdate workflowStates={workflowStates} tasks={tasks} token={token} assignee={assignee}>
        <DndWrapper>
          <Header showCreateTaskButton={true} />
          <TaskBoard
            handleCreate={async (title, description, workflowStateId, assigneeId, assigneeType) => {
              'use server'
              await handleCreate(token, title, description, workflowStateId, assigneeId, assigneeType)
            }}
            updateTask={async (taskId: string, payload: UpdateTaskRequest) => {
              'use server'
              await updateTask({ token, taskId, payload })
            }}
          />
        </DndWrapper>
      </ClientSideStateUpdate>
    </>
  )
}
