import { DndWrapper } from '@/hoc/DndWrapper'
import { TaskBoard } from './ui/TaskBoard'
import { Header } from '@/components/layouts/Header'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'

async function getAllWorkflowStates(token: string): Promise<WorkflowStateResponse[]> {
  const res = await fetch(`${apiUrl}/api/workflow-states?token=${token}`)

  const data = await res.json()

  return data.workflowStates
}

async function getAllTasks(token: string): Promise<WorkflowStateResponse[]> {
  const res = await fetch(`${apiUrl}/api/workflow-states?token=${token}`)

  const data = await res.json()

  return data.workflowStates
}

export default async function Main({ searchParams }: { searchParams: { token: string } }) {
  const token = searchParams.token

  if (!token) {
    throw new Error('Please pass the token!')
  }

  const workflowStates = await getAllWorkflowStates(token)

  return (
    <>
      <ClientSideStateUpdate workflowStates={workflowStates}>
        <DndWrapper>
          <Header showCreateTaskButton={true} />
          <TaskBoard />
        </DndWrapper>
      </ClientSideStateUpdate>
    </>
  )
}
