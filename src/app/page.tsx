export const dynamic = 'force-dynamic'
export const dynamicParams = true

import { DndWrapper } from '@/hoc/DndWrapper'
import { TaskBoard } from './ui/TaskBoard'
import { Header } from '@/components/layouts/Header'
import { z } from 'zod'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { IAssignee, ITemplate, View } from '@/types/interfaces'
import { addTypeToAssignee } from '@/utils/addTypeToAssignee'
import { handleCreate, updateTask, updateViewModeSettings } from './actions'
import { FilterBar } from '@/components/layouts/FilterBar'
import ClientError from '@/components/clientError'
import { Token, TokenSchema } from '@/types/common'
import { CopilotAPI } from '@/utils/CopilotAPI'

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

async function getTokenPayload(token: string): Promise<Token> {
  const copilotClient = new CopilotAPI(token)
  const payload = TokenSchema.parse(await copilotClient.getTokenPayload())
  return payload as Token
}

async function getAssigneeList(token: string): Promise<IAssignee> {
  const res = await fetch(`${apiUrl}/api/users?token=${token}`, {
    next: { tags: ['getAssigneeList'], revalidate: 0 },
  })

  const data = await res.json()

  return data.users
}

async function getViewSettings(token: string): Promise<View> {
  const res = await fetch(`${apiUrl}/api/view-settings?token=${token}`, {
    next: { tags: ['getViewSettings'], revalidate: 0 },
  })

  const data = await res.json()
  return data.viewMode
}

async function getAllTemplates(token: string): Promise<ITemplate[]> {
  const res = await fetch(`${apiUrl}/api/tasks/templates?token=${token}`)

  const templates = await res.json()

  return templates.data
}

export default async function Main({ searchParams }: { searchParams: { token: string } }) {
  const token = searchParams.token

  const parsedToken = z.string().safeParse(searchParams.token)

  if (!parsedToken.success) {
    return <ClientError message={'Please provide a Valid Token'} />
  }

  const [workflowStates, tasks, assignee, viewSettings, tokenPayload, templates] = await Promise.all([
    getAllWorkflowStates(token),
    getAllTasks(token),
    addTypeToAssignee(await getAssigneeList(token)),
    getViewSettings(token),
    getTokenPayload(token),
    getAllTemplates(token),
  ])

  return (
    <>
      <ClientSideStateUpdate
        workflowStates={workflowStates}
        tasks={tasks}
        token={token}
        assignee={assignee}
        viewSettings={viewSettings || View.BOARD_VIEW}
        tokenPayload={tokenPayload}
        templates={templates}
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
