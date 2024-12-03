export const fetchCache = 'force-no-store'

import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TemplateBoard } from './ui/TemplateBoard'
import { apiUrl } from '@/config'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssignee, ITemplate } from '@/types/interfaces'
import { addTypeToAssignee } from '@/utils/addTypeToAssignee'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { createNewTemplate, deleteTemplate, editTemplate } from './actions'
import { ManageTemplateHeader } from './ui/Header'
import { MAX_FETCH_ASSIGNEE_COUNT } from '@/constants/users'
import { CopilotAPI } from '@/utils/CopilotAPI'

async function getAllWorkflowStates(token: string): Promise<WorkflowStateResponse[]> {
  const res = await fetch(`${apiUrl}/api/workflow-states?token=${token}`, {
    next: { tags: ['getAllWorkflowStates'] },
  })

  const data = await res.json()

  return data.workflowStates
}

async function getAssigneeList(token: string): Promise<IAssignee> {
  const res = await fetch(`${apiUrl}/api/users?token=${token}&limit=${MAX_FETCH_ASSIGNEE_COUNT}`, {
    next: { tags: ['getAssigneeList'] },
  })

  const data = await res.json()

  return data.users
}

async function getAllTemplates(token: string): Promise<ITemplate[]> {
  const res = await fetch(`${apiUrl}/api/tasks/templates?token=${token}`, {
    next: { tags: ['getAllTemplates'] },
  })

  const templates = await res.json()

  return templates.data
}

export default async function ManageTemplatesPage({ searchParams }: { searchParams: { token: string } }) {
  const { token } = searchParams

  const copilotClient = new CopilotAPI(token)

  const [workflowStates, assignee, templates, tokenPayload] = await Promise.all([
    await getAllWorkflowStates(token),
    addTypeToAssignee(await getAssigneeList(token)),
    await getAllTemplates(token),
    copilotClient.getTokenPayload(),
  ])

  return (
    <ClientSideStateUpdate
      workflowStates={workflowStates}
      token={token}
      assignee={assignee}
      templates={templates}
      tokenPayload={tokenPayload}
    >
      <AppMargin size={SizeofAppMargin.LARGE}>
        <ManageTemplateHeader showNewTemplateButton={templates?.length > 0} />
        <TemplateBoard
          handleCreateTemplate={async (payload) => {
            'use server'
            await createNewTemplate(token, payload)
          }}
          handleDeleteTemplate={async (templateId) => {
            'use server'
            await deleteTemplate(token, templateId)
          }}
          handleEditTemplate={async (payload, templateId) => {
            'use server'
            await editTemplate(token, templateId, payload)
          }}
        />
      </AppMargin>
    </ClientSideStateUpdate>
  )
}
