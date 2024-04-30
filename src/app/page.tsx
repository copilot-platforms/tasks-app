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
              //This type casting should be removed in the later PR by assigning the AssigneeType type
              //for the assigneeType variable. This is not done in this PR to avoid changes and prevent conflicts
              //in multiple files.
              const _assigneeType = assigneeType as AssigneeType
              handleCreate(token, {
                title,
                body: description,
                workflowStateId,
                assigneeId,
                assigneeType: _assigneeType,
              })
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
