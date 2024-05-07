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
import { IAssigneeCombined } from '@/types/interfaces'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import {
  clearTemplateFields,
  selectCreateTemplate,
  setCreateTemplateFields,
  setShowTemplateModal,
} from '@/redux/features/templateSlice'
import { getAssigneeTypeCorrected } from '@/utils/getAssigneeTypeCorrected'

export const TemplateForm = ({ handleCreate }: { handleCreate: () => void }) => {
  const { workflowStates, assignee } = useSelector(selectTaskBoard)
  const { showTemplateModal } = useSelector(selectCreateTemplate)
  const { assigneeId, workflowStateId } = useSelector(selectCreateTemplate)

  const { renderingItem: _statusValue, updateRenderingItem: updateStatusValue } = useHandleSelectorComponent({
    item: workflowStateId ? workflowStates.find((el) => el.id === workflowStateId) : workflowStates[0],
    type: SelectorType.STATUS_SELECTOR,
  })
  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item: assigneeId ? assignee.find((el) => el.id === assigneeId) : assignee[0],
    type: SelectorType.ASSIGNEE_SELECTOR,
  })

  const statusValue = _statusValue as WorkflowStateResponse //typecasting
  const assigneeValue = _assigneeValue as IAssigneeCombined //typecasting

  return (
    <Modal
      open={showTemplateModal}
      onClose={() => {
        store.dispatch(setShowTemplateModal({}))
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
          <Typography variant="md">Create Template</Typography>
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

          <Stack direction="row" columnGap={3} position="relative">
            <Selector
              getSelectedValue={(newValue) => {
                updateStatusValue(newValue)
                store.dispatch(
                  setCreateTemplateFields({
                    targetField: 'workflowStateId',
                    value: (newValue as WorkflowStateResponse)?.id,
                  }),
                )
              }}
              startIcon={statusIcons[statusValue?.type]}
              options={workflowStates}
              value={statusValue}
              selectorType={SelectorType.STATUS_SELECTOR}
              buttonContent={
                <Typography variant="bodySm" lineHeight="16px" sx={{ color: (theme) => theme.color.gray[600] }}>
                  {statusValue?.name as ReactNode}
                </Typography>
              }
            />
            <Stack alignSelf="flex-start">
              <Selector
                getSelectedValue={(_newValue) => {
                  const newValue = _newValue as IAssigneeCombined
                  updateAssigneeValue(newValue)
                  store.dispatch(
                    setCreateTemplateFields({
                      targetField: 'assigneeType',
                      value: getAssigneeTypeCorrected(newValue),
                    }),
                  )
                  store.dispatch(setCreateTemplateFields({ targetField: 'assigneeId', value: newValue?.id }))
                }}
                startIcon={
                  <Avatar
                    alt="user"
                    src={assigneeValue?.iconImageUrl || assigneeValue?.avatarImageUrl}
                    sx={{ width: '20px', height: '20px' }}
                  />
                }
                options={assignee}
                value={assigneeValue}
                selectorType={SelectorType.ASSIGNEE_SELECTOR}
                buttonContent={
                  <Typography variant="bodySm" lineHeight="16px" sx={{ color: (theme) => theme.color.gray[600] }}>
                    {assigneeValue?.name || assigneeValue?.givenName}
                  </Typography>
                }
              />
            </Stack>
          </Stack>
        </AppMargin>
        <NewTaskFooter handleCreate={handleCreate} />
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

const NewTaskFooter = ({ handleCreate }: { handleCreate: () => void }) => {
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
            <PrimaryBtn handleClick={handleCreate} buttonText="Create" />
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
  width: '685px',
}))
