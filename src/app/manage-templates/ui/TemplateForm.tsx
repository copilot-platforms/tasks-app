'use client'

import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { SelectorType } from '@/components/inputs/Selector'
import Selector from '@/components/inputs/Selector'
import { StyledTextField } from '@/components/inputs/TextField'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { AttachmentIcon } from '@/icons'
import store from '@/redux/store'
import { statusIcons } from '@/utils/iconMatcher'
import { Close } from '@mui/icons-material'
import { Avatar, Box, Modal, Stack, Typography, styled } from '@mui/material'
import { ReactNode } from 'react'
import { IAssigneeCombined, TargetMethod } from '@/types/interfaces'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { WorkflowStateResponse, WorkflowStateResponseSchema } from '@/types/dto/workflowStates.dto'
import {
  clearTemplateFields,
  selectCreateTemplate,
  setCreateTemplateFields,
  setShowTemplateModal,
} from '@/redux/features/templateSlice'
import { getAssigneeTypeCorrected } from '@/utils/getAssigneeTypeCorrected'

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
            <Typography variant="md">Create Template</Typography>
          ) : (
            <Typography variant="md">Edit Template</Typography>
          )}
          <Close
            sx={{ color: (theme) => theme.color.gray[500], cursor: 'pointer' }}
            onClick={() => {
              store.dispatch(setShowTemplateModal({}))
              store.dispatch(clearTemplateFields())
            }}
          />
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
  const { templateName, taskName, description } = useSelector(selectCreateTemplate)

  return (
    <>
      <Stack direction="column" rowGap={1}>
        <Typography variant="md">Template Name</Typography>
        <StyledTextField
          type="text"
          padding="8px 0px"
          value={templateName}
          onChange={(e) => store.dispatch(setCreateTemplateFields({ targetField: 'templateName', value: e.target.value }))}
        />

        <Typography variant="md">Task name</Typography>
        <StyledTextField
          type="text"
          padding="8px 0px"
          value={taskName}
          onChange={(e) => store.dispatch(setCreateTemplateFields({ targetField: 'taskName', value: e.target.value }))}
        />
      </Stack>
      <Stack direction="column" rowGap={1} m="16px 0px">
        <Typography variant="md">Description</Typography>
        <StyledTextField
          type="text"
          placeholder="Add description..."
          multiline
          rows={6}
          inputProps={{ style: { resize: 'vertical' } }}
          value={description}
          onChange={(e) => store.dispatch(setCreateTemplateFields({ targetField: 'description', value: e.target.value }))}
        />
      </Stack>
    </>
  )
}

const NewTaskFooter = ({ handleCreate, targetMethod }: { handleCreate: () => void; targetMethod: TargetMethod }) => {
  return (
    <Box sx={{ borderTop: (theme) => `1px solid ${theme.color.borders.border2}` }}>
      <AppMargin size={SizeofAppMargin.MEDIUM} py="21px">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <AttachmentIcon />
          </Box>
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
