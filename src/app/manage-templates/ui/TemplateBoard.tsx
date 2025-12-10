'use client'
import { TemplateCard } from '@/components/cards/TemplateCard'
import { ConfirmDeleteUI } from '@/components/layouts/ConfirmDeleteUI'
import { selectTaskDetails, setShowConfirmDeleteModal } from '@/redux/features/taskDetailsSlice'
import {
  clearTemplateFields,
  selectCreateTemplate,
  setCreateTemplateFields,
  setShowTemplateModal,
  setTargetTemplateId,
  setTemplates,
} from '@/redux/features/templateSlice'
import store from '@/redux/store'
import { CreateTemplateRequest } from '@/types/dto/templates.dto'
import { ITemplate, TargetMethod } from '@/types/interfaces'
import { Box, Stack, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { NoTemplateLayout } from './NoTemplateLayout'
import { TemplateForm } from './TemplateForm'
import { ManageTemplateHeader } from '@/app/manage-templates/ui/Header'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { StyledModal } from '@/app/detail/ui/styledComponent'
import { CustomLink } from '@/hoc/CustomLink'
import { getCardHrefTemplate } from '@/utils/getCardHref'

export const TemplateBoard = ({
  handleCreateTemplate,
  handleDeleteTemplate,
  handleEditTemplate,
}: {
  handleCreateTemplate: (payload: CreateTemplateRequest) => Promise<any>
  handleDeleteTemplate: (templateId: string) => void
  handleEditTemplate: (payload: CreateTemplateRequest, templateId: string) => void
}) => {
  const { targetTemplateId, targetMethod, templates, showTemplateModal, workflowStateId, taskName, description } =
    useSelector(selectCreateTemplate)

  const { token, previewMode } = useSelector(selectTaskBoard)

  const { showConfirmDeleteModal } = useSelector(selectTaskDetails)

  if (templates === undefined) {
    return null
  }
  const showHeader = token && !!previewMode

  return (
    <>
      {showHeader && <ManageTemplateHeader token={token} />}

      {templates.length ? (
        <Box id="templates-box" sx={{ maxWidth: '384px', marginTop: '32px', marginLeft: 'auto', marginRight: 'auto' }}>
          <Box
            sx={{
              width: { xs: '90%', sm: '100%' },
              margin: '0 auto',
            }}
          >
            <Typography variant="xl" lineHeight={'28px'}>
              Templates
            </Typography>
          </Box>

          <Stack
            direction="column"
            py="24px"
            sx={{
              width: { xs: '90%', sm: '100%' },
              margin: '0 auto',
            }}
            rowGap={4}
          >
            {templates.map((template) => {
              return (
                <CustomLink
                  key={template.id}
                  href={{
                    pathname: getCardHrefTemplate(template),
                    query: { token },
                  }}
                  style={{ width: 'auto' }}
                >
                  <TemplateCard title={template.title} key={template.id} />
                </CustomLink>
              )
            })}
          </Stack>
        </Box>
      ) : (
        <NoTemplateLayout />
      )}

      <StyledModal
        open={showTemplateModal}
        onClose={() => {
          store.dispatch(setShowTemplateModal({}))
          store.dispatch(clearTemplateFields())
        }}
        aria-labelledby="create-task-modal"
        aria-describedby="add-new-task"
      >
        <TemplateForm
          handleCreate={async () => {
            store.dispatch(setShowTemplateModal({}))
            store.dispatch(clearTemplateFields())
            const temp = {
              title: taskName,
              workflowStateId: workflowStateId,
              body: description,
            }
            if (targetMethod === TargetMethod.POST) {
              const resp = await handleCreateTemplate(temp)
            } else {
              handleEditTemplate(temp, targetTemplateId)
            }
          }}
        />
      </StyledModal>

      <StyledModal
        open={showConfirmDeleteModal}
        onClose={() => store.dispatch(setShowConfirmDeleteModal())}
        aria-labelledby="delete-task-modal"
        aria-describedby="delete-task"
      >
        <ConfirmDeleteUI
          handleCancel={() => store.dispatch(setShowConfirmDeleteModal())}
          handleDelete={() => {
            store.dispatch(setShowConfirmDeleteModal())
            handleDeleteTemplate(targetTemplateId)
            store.dispatch(clearTemplateFields())
          }}
          description={`“${taskName}” will be permanently deleted.`}
          customBody={'Delete template?'}
        />
      </StyledModal>
    </>
  )
}
