import { DndWrapper } from '@/hoc/DndWrapper'
import { TaskBoard } from './ui/TaskBoard'
import { Header } from '@/components/layouts/Header'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { TaskResponse, AssigneeType } from '@/types/dto/tasks.dto'
import { IAssignee } from '@/types/interfaces'
import { addTypeToAssignee } from '@/utils/addTypeToAssignee'
import { handleCreate, updateWorkflowStateIdOfTask } from './actions'
import { FilterBar } from '@/components/layouts/FilterBar'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { Token, TokenSchema } from '@/types/common'

export const revalidate = 0

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

async function getTokenPayload(token: string): Promise<Token> {
  const copilotClient = new CopilotAPI(token)
  const payload = TokenSchema.safeParse(await copilotClient.getTokenPayload())
  return payload.data as Token
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
          <FilterBar
            getTokenPayload={async (): Promise<Token> => {
              'use server'
              return getTokenPayload(token)
            }}
          />
          <TaskBoard
            handleCreate={async (createTaskPayload) => {
              'use server'
              handleCreate(token, createTaskPayload)
            }}
            updateWorkflowStateIdOfTask={async (taskId, targetWorkflowStateId) => {
              'use server'
              updateWorkflowStateIdOfTask(token, taskId, targetWorkflowStateId)
            }}
          />
        </DndWrapper>
      </ClientSideStateUpdate>
    </>
  )
}
