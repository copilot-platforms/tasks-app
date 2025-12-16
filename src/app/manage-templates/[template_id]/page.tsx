import { getAllWorkflowStates, getTokenPayload, getWorkspace } from '@/app/(home)/page'
import { ResponsiveStack } from '@/app/detail/ui/ResponsiveStack'
import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { RealTimeTemplates } from '@/hoc/RealtimeTemplates'
import { ITemplate, UserType } from '@/types/interfaces'
import EscapeHandler from '@/utils/escapeHandler'
import { Box } from '@mui/material'
import TemplateDetails from '@/app/manage-templates/ui/TemplateDetails'
import { deleteTemplate, editTemplate } from '@/app/manage-templates/actions'
import { UpdateTemplateRequest } from '@/types/dto/templates.dto'
import { StyledTiptapDescriptionWrapper, TaskDetailsContainer } from '@/app/detail/ui/styledComponent'
import { TemplateSidebar } from '@/app/manage-templates/ui/TemplateSidebar'
import { Subtemplates } from '@/app/manage-templates/ui/Subtemplates'
import { HeaderBreadcrumbs } from '@/components/layouts/HeaderBreadcrumbs'
import { ManageTemplateDetailsAppBridge } from '@/app/manage-templates/ui/ManageTemplatesDetailsAppBridge'
import { DeletedRedirectPage } from '@/components/layouts/DeletedRedirectPage'
import { OneTemplateDataFetcher } from '@/app/_fetchers/OneTemplateDataFetcher'

async function getTemplate(id: string, token: string): Promise<ITemplate> {
  const res = await fetch(`${apiUrl}/api/tasks/templates/${id}?token=${token}`, {
    cache: 'no-store',
  })

  const templates = await res.json()
  return templates.data
}

export default async function TaskDetailPage({
  params,
  searchParams,
}: {
  params: { template_id: string }
  searchParams: { token: string }
}) {
  const { token } = searchParams
  const { template_id } = params

  const [workflowStates, template, tokenPayload, workspace] = await Promise.all([
    getAllWorkflowStates(token),
    getTemplate(template_id, token),
    getTokenPayload(token),
    getWorkspace(token),
  ])

  if (!template) {
    return <DeletedRedirectPage token={token} />
  }

  const breadcrumbTemplates = [template]

  if (template.parentId) {
    template.parent && breadcrumbTemplates.unshift(template.parent)
  }

  const breadcrumbItems: { label: string; href: string }[] = [
    { label: 'Manage templates', href: `/manage-templates?token=${token}` },
    ...breadcrumbTemplates.map((template) => ({
      label: template.title,
      href: `/manage-templates/${template.id}?token=${token}`,
    })),
  ]

  return (
    <ClientSideStateUpdate workflowStates={workflowStates} token={token} template={template} tokenPayload={tokenPayload}>
      {token && <OneTemplateDataFetcher token={token} template_id={template_id} initialTemplate={template} />}
      <RealTimeTemplates tokenPayload={tokenPayload} token={token}>
        <EscapeHandler />
        <ResponsiveStack fromNotificationCenter={false}>
          <Box sx={{ width: '100%', display: 'flex', flex: 1, flexDirection: 'column', overflow: 'auto' }}>
            <HeaderBreadcrumbs token={token} items={breadcrumbItems} userType={UserType.INTERNAL_USER} />
            <ManageTemplateDetailsAppBridge portalUrl={workspace.portalUrl} template={template} />
            <TaskDetailsContainer
              sx={{
                padding: { xs: '20px 16px ', sm: '30px 20px' },
              }}
            >
              <StyledTiptapDescriptionWrapper>
                <TemplateDetails
                  template={template}
                  template_id={template_id}
                  handleDeleteTemplate={async (templateId: string) => {
                    'use server'
                    await deleteTemplate(token, templateId)
                  }}
                  handleEditTemplate={async (payload: UpdateTemplateRequest, templateId: string) => {
                    'use server'
                    await editTemplate(token, templateId, payload)
                  }}
                  updateTemplateDetail={async (detail: string) => {
                    'use server'
                    await editTemplate(token, template_id, { body: detail })
                  }}
                  updateTemplateTitle={async (title: string) => {
                    'use server'
                    title.trim() != '' && (await editTemplate(token, template_id, { title }))
                  }}
                  token={token}
                />
              </StyledTiptapDescriptionWrapper>
              {!template.parentId && <Subtemplates template_id={template_id} token={token} />}
            </TaskDetailsContainer>
          </Box>

          <TemplateSidebar
            template_id={template_id}
            // selectedWorkflowState={task?.workflowState}
            updateWorkflowState={async (workflowState) => {
              'use server'
              await editTemplate(token, template_id, { workflowStateId: workflowState?.id })
            }}
          />
        </ResponsiveStack>
      </RealTimeTemplates>
    </ClientSideStateUpdate>
  )
}
