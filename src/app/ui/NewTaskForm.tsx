import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { SelectorType } from '@/components/inputs/Selector'
import Selector from '@/components/inputs/Selector'
import { StyledTextField } from '@/components/inputs/TextField'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { AttachmentIcon } from '@/icons'
import { selectCreateTask, setCreateTaskFields, setShowModal } from '@/redux/features/createTaskSlice'
import store from '@/redux/store'
import { statusIcons } from '@/utils/iconMatcher'
import { Close } from '@mui/icons-material'
import { Avatar, Box, Stack, Typography, styled } from '@mui/material'
import { ReactNode } from 'react'
import { IAssigneeCombined } from '@/types/interfaces'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'

export const NewTaskForm = ({ handleCreate }: { handleCreate: () => void }) => {
  const { workflowStates, assignee } = useSelector(selectTaskBoard)

  const { renderingItem: statusValue, updateRenderingItem: updateStatusValue } = useHandleSelectorComponent({
    item: workflowStates[0],
    type: SelectorType.STATUS_SELECTOR,
  })
  const { renderingItem: assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item: assignee[0],
    type: SelectorType.ASSIGNEE_SELECTOR,
  })

  return (
    <NewTaskContainer>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="end"
        sx={{
          border: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
        }}
      >
        <AppMargin size={SizeofAppMargin.MEDIUM} py="12px">
          <Close
            sx={{ color: (theme) => theme.color.gray[500], cursor: 'pointer' }}
            onClick={() => store.dispatch(setShowModal())}
          />
        </AppMargin>
      </Stack>

      <AppMargin size={SizeofAppMargin.MEDIUM} py="16px">
        <NewTaskFormInputs />

        <Stack direction="row" columnGap={3} position="relative">
          <Selector
            getSelectedValue={(newValue) => {
              updateStatusValue(newValue)
              store.dispatch(
                setCreateTaskFields({ targetField: 'workflowStateId', value: (newValue as WorkflowStateResponse)?.id }),
              )
            }}
            startIcon={statusIcons[(statusValue as WorkflowStateResponse)?.type]}
            options={workflowStates}
            value={statusValue}
            selectorType={SelectorType.STATUS_SELECTOR}
            buttonContent={
              <Typography variant="bodySm" lineHeight="16px" sx={{ color: (theme) => theme.color.gray[600] }}>
                {(statusValue as WorkflowStateResponse)?.name as ReactNode}
              </Typography>
            }
          />
          <Stack alignSelf="flex-start">
            <Selector
              getSelectedValue={(newValue) => {
                updateAssigneeValue(newValue as IAssigneeCombined)
                const assigneeType = (newValue as IAssigneeCombined)?.type
                store.dispatch(
                  setCreateTaskFields({
                    targetField: 'assigneeType',
                    value:
                      assigneeType === 'ius'
                        ? 'internalUser'
                        : assigneeType === 'clients'
                          ? 'client'
                          : assigneeType === 'companies'
                            ? 'company'
                            : '',
                  }),
                )
                store.dispatch(
                  setCreateTaskFields({ targetField: 'assigneeId', value: (newValue as IAssigneeCombined)?.id }),
                )
              }}
              startIcon={
                <Avatar
                  alt="user"
                  src={
                    (assigneeValue as IAssigneeCombined)?.iconImageUrl ||
                    (assigneeValue as IAssigneeCombined)?.avatarImageUrl
                  }
                  sx={{ width: '20px', height: '20px' }}
                />
              }
              options={assignee}
              value={assigneeValue}
              selectorType={SelectorType.ASSIGNEE_SELECTOR}
              buttonContent={
                <Typography variant="bodySm" lineHeight="16px" sx={{ color: (theme) => theme.color.gray[600] }}>
                  {(assigneeValue as IAssigneeCombined)?.name || (assigneeValue as IAssigneeCombined)?.givenName}
                </Typography>
              }
            />
          </Stack>
        </Stack>
      </AppMargin>
      <NewTaskFooter handleCreate={handleCreate} />
    </NewTaskContainer>
  )
}

const NewTaskFormInputs = () => {
  const { title, description } = useSelector(selectCreateTask)

  return (
    <>
      <Stack direction="column" rowGap={1}>
        <Typography variant="md">Task name</Typography>
        <StyledTextField
          type="text"
          padding="8px 0px"
          value={title}
          onChange={(e) => store.dispatch(setCreateTaskFields({ targetField: 'title', value: e.target.value }))}
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
          onChange={(e) => store.dispatch(setCreateTaskFields({ targetField: 'description', value: e.target.value }))}
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
                store.dispatch(setShowModal())
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
