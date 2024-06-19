import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TemplateBoard } from './ui/TemplateBoard'
import { apiUrl } from '@/config'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssignee, ITemplate } from '@/types/interfaces'
import { addTypeToAssignee } from '@/utils/addTypeToAssignee'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { createNewTemplate, deleteTemplate, editTemplate } from './actions'
import { ManageTemplateHeader } from './ui/Header'

async function getAllWorkflowStates(token: string): Promise<WorkflowStateResponse[]> {
  const res = await fetch(`${apiUrl}/api/workflow-states?token=${token}`, {
    next: { tags: ['getAllWorkflowStates'] },
    cache: 'no-store',
  })

  const data = await res.json()

  return data.workflowStates
}

async function getAssigneeList(token: string): Promise<IAssignee> {
  const res = await fetch(`${apiUrl}/api/users?token=${token}`, {
    next: { tags: ['getAssigneeList'] },
    cache: 'no-store',
  })

  const data = await res.json()

  return data.users
}

async function getAllTemplates(token: string): Promise<ITemplate[]> {
  const res = await fetch(`${apiUrl}/api/tasks/templates?token=${token}`, {
    next: { tags: ['getAllTemplates'], revalidate: 0 },
    cache: 'no-store',
  })

  const templates = await res.json()

  return templates.data
}

export default async function ManageTemplatesPage({ searchParams }: { searchParams: { token: string } }) {
  const { token } = searchParams

  const [workflowStates, assignee, templates] = await Promise.all([
    await getAllWorkflowStates(token),
    addTypeToAssignee(await getAssigneeList(token)),
    await getAllTemplates(token),
  ])

  return (
    <ClientSideStateUpdate workflowStates={workflowStates} token={token} assignee={assignee} templates={templates}>
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
