export const fetchCache = 'force-no-store'

import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TemplateBoard } from './ui/TemplateBoard'
import { createNewTemplate, deleteTemplate, editTemplate } from './actions'
import { ManageTemplateHeader } from './ui/Header'

export default async function ManageTemplatesPage({ searchParams }: { searchParams: { token: string } }) {
  const { token } = searchParams

  return (
    <AppMargin size={SizeofAppMargin.LARGE}>
      <ManageTemplateHeader />
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
  )
}
