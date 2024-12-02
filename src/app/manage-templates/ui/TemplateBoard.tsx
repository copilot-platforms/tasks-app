'use client'
import { TemplateCard } from '@/components/cards/TemplateCard'
import {
  clearTemplateFields,
  selectCreateTemplate,
  setCreateTemplateFields,
  setShowTemplateModal,
  setTargetTemplateId,
} from '@/redux/features/templateSlice'
import { Modal, Stack } from '@mui/material'
import { useSelector } from 'react-redux'
import { TemplateForm } from './TemplateForm'
import store from '@/redux/store'
import { CreateTemplateRequest } from '@/types/dto/templates.dto'
import { TargetMethod } from '@/types/interfaces'
import { NoTemplateLayout } from './NoTemplateLayout'
import { selectTaskDetails, setShowConfirmDeleteModal } from '@/redux/features/taskDetailsSlice'
import { ConfirmDeleteUI } from '@/components/layouts/ConfirmDeleteUI'

export const TemplateBoard = ({
  handleCreateTemplate,
  handleDeleteTemplate,
  handleEditTemplate,
}: {
  handleCreateTemplate: (payload: CreateTemplateRequest) => void
  handleDeleteTemplate: (templateId: string) => void
  handleEditTemplate: (payload: CreateTemplateRequest, templateId: string) => void
}) => {
  const { targetTemplateId, targetMethod, templates, showTemplateModal, templateName, taskName, description } =
    useSelector(selectCreateTemplate)

  const { showConfirmDeleteModal } = useSelector(selectTaskDetails)

  return (
    <>
      {templates.length > 0 ? (
        <Stack
          direction="column"
          py="40px"
          sx={{
            width: { xs: '90%', sm: '60%' },
            margin: '0 auto',
          }}
          rowGap={4}
        >
          {templates.map((template, key) => {
            return (
              <TemplateCard
                templateName={template.templateName}
                key={key}
                handleDelete={() => {
                  store.dispatch(setShowConfirmDeleteModal())
                  store.dispatch(setTargetTemplateId(template.id))
                }}
                handleEdit={() => {
                  store.dispatch(setShowTemplateModal({ targetMethod: TargetMethod.EDIT, targetTemplateId: template.id }))
                  store.dispatch(setCreateTemplateFields({ targetField: 'templateName', value: template.templateName }))
                  store.dispatch(setCreateTemplateFields({ targetField: 'taskName', value: template.title }))
                  store.dispatch(setCreateTemplateFields({ targetField: 'description', value: template.body }))
                }}
              />
            )
          })}
        </Stack>
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
          handleCreate={() => {
            store.dispatch(setShowTemplateModal({}))
            store.dispatch(clearTemplateFields())
            const temp = {
              templateName,
              // WARNING: @arpandhakal remove this while doing frontend integration with new selector data
              workflowStateId: 'remove-this',
              title: taskName,
              body: description,
            }
            if (targetMethod === TargetMethod.POST) {
              handleCreateTemplate(temp)
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
