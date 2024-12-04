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
import { Box, Modal, Stack, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { NoTemplateLayout } from './NoTemplateLayout'
import { TemplateForm } from './TemplateForm'

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

  const { showConfirmDeleteModal } = useSelector(selectTaskDetails)

  if (templates === undefined) {
    return null
  }

  return (
    <>
      {templates.length ? (
        <Box id="templates-box" sx={{ maxWidth: '384px', marginTop: '32px', marginLeft: 'auto', marginRight: 'auto' }}>
          <Typography variant="xl" lineHeight={'28px'}>
            Templates
          </Typography>

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
                <TemplateCard
                  title={template.title}
                  key={template.id}
                  handleDelete={() => {
                    store.dispatch(setShowConfirmDeleteModal())
                    store.dispatch(setTargetTemplateId(template.id))
                  }}
                  handleEdit={() => {
                    store.dispatch(setShowTemplateModal({ targetMethod: TargetMethod.EDIT, targetTemplateId: template.id }))
                    store.dispatch(setCreateTemplateFields({ targetField: 'taskName', value: template.title }))
                    store.dispatch(setCreateTemplateFields({ targetField: 'description', value: template.body }))
                  }}
                />
              )
            })}
          </Stack>
        </Box>
      ) : (
        <NoTemplateLayout />
      )}

      <Modal
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
              const data = await handleCreateTemplate(temp)
              store.dispatch(setTemplates([data as ITemplate, ...templates]))
            } else {
              handleEditTemplate(temp, targetTemplateId)
            }
          }}
        />
      </Modal>

      <Modal
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
          }}
        />
      </Modal>
    </>
  )
}
