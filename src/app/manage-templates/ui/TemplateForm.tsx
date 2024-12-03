'use client'

import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { StyledTextField } from '@/components/inputs/TextField'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { AttachmentIcon } from '@/icons'
import store from '@/redux/store'
import { Close } from '@mui/icons-material'
import { Box, Modal, Stack, Typography, styled } from '@mui/material'
import { createTemplateErrors, TargetMethod } from '@/types/interfaces'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import {
  clearTemplateFields,
  selectCreateTemplate,
  setCreateTemplateFields,
  setErrors,
  setShowTemplateModal,
} from '@/redux/features/templateSlice'
import { Tapwrite } from 'tapwrite'
import { MAX_UPLOAD_LIMIT } from '@/constants/attachments'
import { WorkflowStateSelector } from '@/components/inputs/Selector-WorkflowState'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { SelectorType } from '@/components/inputs/Selector'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'

export const TemplateForm = ({ handleCreate }: { handleCreate: () => void }) => {
  const { workflowStates, assignee } = useSelector(selectTaskBoard)
  const { showTemplateModal, targetMethod } = useSelector(selectCreateTemplate)

  return (
    <Modal
      open={showTemplateModal}
      onClose={() => {
        store.dispatch(setShowTemplateModal({}))
        store.dispatch(clearTemplateFields())
      }}
      aria-labelledby="create-task-modal"
      aria-describedby="add-new-task"
    >
      <NewTaskContainer>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            border: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
            padding: '16px 28px',
          }}
        >
          {targetMethod === TargetMethod.POST ? (
            <Typography variant="md" fontSize={'15px'} lineHeight={'18.15px'}>
              Create Template
            </Typography>
          ) : (
            <Typography variant="md" fontSize={'15px'} lineHeight={'18.15px'}>
              Edit Template
            </Typography>
          )}
        </Stack>

        <AppMargin size={SizeofAppMargin.MEDIUM} py="16px">
          <NewTaskFormInputs />
        </AppMargin>
        <NewTaskFooter handleCreate={handleCreate} targetMethod={targetMethod} />
      </NewTaskContainer>
    </Modal>
  )
}

const NewTaskFormInputs = () => {
  const { workflowStateId, taskName, description, errors, activeWorkflowStateId } = useSelector(selectCreateTemplate)
  const { workflowStates } = useSelector(selectTaskBoard)

  const todoWorkflowState = workflowStates.find((el) => el.key === 'todo') || workflowStates[0]

  const defaultWorkflowState = activeWorkflowStateId
    ? workflowStates.find((state) => state.id === activeWorkflowStateId)
    : todoWorkflowState

  const { renderingItem: _statusValue, updateRenderingItem: updateStatusValue } = useHandleSelectorComponent({
    item: defaultWorkflowState,
    type: SelectorType.STATUS_SELECTOR,
  })

  const statusValue = _statusValue as WorkflowStateResponse //typecasting

  const handleDescriptionChange = (content: string) => {
    store.dispatch(setCreateTemplateFields({ targetField: 'description', value: content }))
  }
  return (
    <>
      <Stack direction="column" rowGap={1}>
        <Typography variant="md" lineHeight={'22px'}>
          Name
        </Typography>
        <StyledTextField
          type="text"
          padding="8px 0px"
          autoFocus={true}
          value={taskName}
          onChange={(e) => {
            store.dispatch(setCreateTemplateFields({ targetField: 'taskName', value: e.target.value }))
            store.dispatch(setErrors({ key: createTemplateErrors.TITLE, value: false }))
          }}
          error={errors.title}
          helperText={errors.title && 'Required'}
          inputProps={{
            maxLength: 255,
          }}
        />
      </Stack>
      <Stack direction="column" rowGap={1} m="16px 0px">
        <Typography variant="md" lineHeight={'22px'}>
          Description
        </Typography>
        <Tapwrite
          content={description}
          getContent={handleDescriptionChange}
          placeholder="Add description..."
          editorClass="tapwrite-task-description"
          // uploadFn={uploadFn}
          // deleteEditorAttachments={(url) => deleteEditorAttachmentsHandler(url, token ?? '', null)}
          // attachmentLayout={AttachmentLayout}
          maxUploadLimit={MAX_UPLOAD_LIMIT}
          parentContainerStyle={{ gap: '0px' }}
        />
      </Stack>
      <Stack direction="column" rowGap={1} m="0px 0px">
        <Box sx={{ padding: 0.1 }}>
          <WorkflowStateSelector
            option={workflowStates}
            value={statusValue}
            getValue={(value) => {
              updateStatusValue(value)
              store.dispatch(setCreateTemplateFields({ targetField: 'workflowStateId', value: value.id }))
            }}
          />
        </Box>
      </Stack>
    </>
  )
}

const NewTaskFooter = ({ handleCreate, targetMethod }: { handleCreate: () => void; targetMethod: TargetMethod }) => {
  return (
    <Box sx={{ borderTop: (theme) => `1px solid ${theme.color.borders.border2}` }}>
      <AppMargin size={SizeofAppMargin.MEDIUM} py="16px">
        <Stack direction="row" justifyContent="right" alignItems="center">
          <Stack direction="row" columnGap={4}>
            <SecondaryBtn
              handleClick={() => {
                store.dispatch(setShowTemplateModal({}))
                store.dispatch(clearTemplateFields())
              }}
              buttonContent={
                <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[700] }}>
                  Cancel
                </Typography>
              }
            />
            <PrimaryBtn handleClick={handleCreate} buttonText={targetMethod === TargetMethod.POST ? 'Create' : 'Edit'} />
          </Stack>
        </Stack>
      </AppMargin>
    </Box>
  )
}

const NewTaskContainer = styled(Box)(({ theme }) => ({
  margin: '0 auto',
  background: '#ffffff',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  boxShadow: '0px 16px 70px 0px rgba(0, 0, 0, 0.5)',
  border: `1px solid ${theme.color.borders.border2}`,
  borderRadius: '4px',
  width: '80%',
  maxWidth: '650px',
}))
