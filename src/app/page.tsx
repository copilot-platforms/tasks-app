import { DndWrapper } from '@/hoc/DndWrapper'
import { TaskBoard } from './ui/TaskBoard'
import { Header } from '@/components/layouts/Header'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { revalidateTag } from 'next/cache'

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

export default async function Main({ searchParams }: { searchParams: { token: string } }) {
  const token = searchParams.token

  if (!token) {
    throw new Error('Please pass the token!')
  }

  const workflowStates = await getAllWorkflowStates(token)
  const tasks = await getAllTasks(token)

  return (
    <>
      <ClientSideStateUpdate workflowStates={workflowStates} tasks={tasks}>
        <DndWrapper>
          <Header showCreateTaskButton={true} />
          <TaskBoard
            handleCreate={async (title, description, workflowStateId) => {
              'use server'
              fetch(`${apiUrl}/api/tasks?token=${token}`, {
                method: 'POST',
                body: JSON.stringify({
                  title,
                  body: description,
                  workflowStateId,
                }),
              })
              revalidateTag('getAllTasks')
            }}
            updateWorkflowStateIdOfTask={async (taskId, targetWorkflowStateId) => {
              'use server'
              fetch(`${apiUrl}/api/tasks/${taskId}?token=${token}`, {
                method: 'PATCH',
                body: JSON.stringify({
                  workflowStateId: targetWorkflowStateId,
                }),
              })
              revalidateTag('getAllTasks')
            }}
          />
        </DndWrapper>
      </ClientSideStateUpdate>
    </>
  )
}
