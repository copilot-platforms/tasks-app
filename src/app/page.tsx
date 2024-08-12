export const fetchCache = 'force-no-store'

import { DndWrapper } from '@/hoc/DndWrapper'
import { TaskBoard } from './ui/TaskBoard'
import { z } from 'zod'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { IAssignee, ITemplate } from '@/types/interfaces'
import { addTypeToAssignee } from '@/utils/addTypeToAssignee'
import ClientError from '@/components/clientError'
import { Token, TokenSchema } from '@/types/common'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'
import { createMultipleAttachments, getSignedUrlUpload } from '@/app/actions'
import { ModalNewTaskForm } from './ui/Modal_NewTaskForm'
import { MAX_FETCH_ASSIGNEE_COUNT } from '@/constants/users'
import { RealTime } from '@/hoc/RealTime'
import { redirectIfTaskCta } from '@/utils/redirect'
import { sortTaskByDescendingOrder } from '@/utils/sortTask'

async function getAllWorkflowStates(token: string): Promise<WorkflowStateResponse[]> {
  const res = await fetch(`${apiUrl}/api/workflow-states?token=${token}`, {
    next: { tags: ['getAllWorkflowStates'] },
  })

  const data = await res.json()

  return data.workflowStates
}

async function getAllTasks(token: string): Promise<TaskResponse[]> {
  const res = await fetch(`${apiUrl}/api/tasks?token=${token}`, {
    next: { tags: ['getTasks'] },
  })

  const data = await res.json()

  return sortTaskByDescendingOrder(data.tasks)
}

async function getTokenPayload(token: string): Promise<Token> {
  const copilotClient = new CopilotAPI(token)
  const payload = TokenSchema.parse(await copilotClient.getTokenPayload())
  return payload as Token
}

async function getAssigneeList(token: string): Promise<IAssignee> {
  const res = await fetch(`${apiUrl}/api/users?token=${token}&limit=${MAX_FETCH_ASSIGNEE_COUNT}`, {
    next: { tags: ['getAssigneeList'] },
  })

  const data = await res.json()

  return data.users
}

async function getViewSettings(token: string): Promise<CreateViewSettingsDTO> {
  const res = await fetch(`${apiUrl}/api/view-settings?token=${token}`, {
    next: { tags: ['getViewSettings'] },
  })
  const data = await res.json()

  return data
}

async function getAllTemplates(token: string): Promise<ITemplate[]> {
  const res = await fetch(`${apiUrl}/api/tasks/templates?token=${token}`, {})

  const templates = await res.json()

  return templates.data
}

export default async function Main({ searchParams }: { searchParams: { token: string; taskId?: string } }) {
  const token = searchParams.token

  const parsedToken = z.string().safeParse(searchParams.token)
  if (!parsedToken.success) {
    return <ClientError message={'Please provide a Valid Token'} />
  }

  redirectIfTaskCta(searchParams)

  const [workflowStates, tasks, assignee, viewSettings, tokenPayload, templates] = await Promise.all([
    getAllWorkflowStates(token),
    getAllTasks(token),
    addTypeToAssignee(await getAssigneeList(token)),
    getViewSettings(token),
    getTokenPayload(token),
    getAllTemplates(token),
  ])

  return (
    <ClientSideStateUpdate
      workflowStates={workflowStates}
      tasks={tasks}
      token={token}
      assignee={assignee}
      viewSettings={viewSettings}
      tokenPayload={tokenPayload}
      templates={templates}
    >
      <DndWrapper>
        <TaskBoard />
      </DndWrapper>

      <ModalNewTaskForm
        getSignedUrlUpload={async (fileName: string) => {
          'use server'
          return await getSignedUrlUpload(token, fileName)
        }}
        handleCreateMultipleAttachments={async (attachments: CreateAttachmentRequest[]) => {
          'use server'
          await createMultipleAttachments(token, attachments)
        }}
      />
    </ClientSideStateUpdate>
  )
}
