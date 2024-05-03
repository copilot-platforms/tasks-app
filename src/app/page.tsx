export const dynamic = 'force-dynamic'
export const dynamicParams = true

import { DndWrapper } from '@/hoc/DndWrapper'
import { TaskBoard } from './ui/TaskBoard'
import { Header } from '@/components/layouts/Header'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { TaskResponse, AssigneeType, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { IAssignee, View } from '@/types/interfaces'
import { addTypeToAssignee } from '@/utils/addTypeToAssignee'
import { handleCreate, updateTask, updateViewModeSettings, updateWorkflowStateIdOfTask } from './actions'
import { FilterBar } from '@/components/layouts/FilterBar'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'

async function getAllWorkflowStates(token: string): Promise<WorkflowStateResponse[]> {
  const res = await fetch(`${apiUrl}/api/workflow-states?token=${token}`, {
    next: { tags: ['getAllWorkflowStates'] },
  })

  const data = await res.json()

  return data.workflowStates
}

async function getAllTasks(token: string): Promise<TaskResponse[]> {
  const res = await fetch(`${apiUrl}/api/tasks?token=${token}`, {
    next: { tags: ['getAllTasks'] },
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

async function getViewSettings(token: string): Promise<CreateViewSettingsDTO> {
  const res = await fetch(`${apiUrl}/api/view-settings?token=${token}`, {
    next: { tags: ['getViewSettings'], revalidate: 0 },
  })

  return await res.json()
}

export default async function Main({ searchParams }: { searchParams: { token: string } }) {
  const token = searchParams.token

  if (!token) {
    throw new Error('Please pass the token!')
  }

  const workflowStates = await getAllWorkflowStates(token)
  const tasks = await getAllTasks(token)
  const assignee = addTypeToAssignee(await getAssigneeList(token))
  const viewSettings = await getViewSettings(token)

  return (
    <>
      <ClientSideStateUpdate
        workflowStates={workflowStates}
        tasks={tasks}
        token={token}
        assignee={assignee}
        viewSettings={viewSettings?.viewMode || View.BOARD_VIEW}
      >
        <DndWrapper>
          <Header showCreateTaskButton={true} />
          <FilterBar
            updateViewModeSetting={async (mode) => {
              'use server'
              await updateViewModeSettings(token, mode)
            }}
          />
          <TaskBoard
            handleCreate={async (createTaskPayload) => {
              'use server'
              await handleCreate(token, createTaskPayload)
            }}
            updateTask={async (taskId, payload) => {
              'use server'
              await updateTask({ token, taskId, payload })
            }}
          />
        </DndWrapper>
      </ClientSideStateUpdate>
    </>
  )
}
