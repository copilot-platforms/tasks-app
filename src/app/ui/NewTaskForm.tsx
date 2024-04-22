import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { SelectorType } from '@/components/inputs/Selector'
import Selector from '@/components/inputs/Selector'
import { StyledTextField } from '@/components/inputs/TextField'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { AttachmentIcon } from '@/icons'
import { setShowModal } from '@/redux/features/createTaskSlice'
import store from '@/redux/store'
import { statusIcons } from '@/utils/iconMatcher'
import { Close } from '@mui/icons-material'
import { Avatar, Box, Stack, Typography, styled } from '@mui/material'
import { ReactNode } from 'react'
import { assignee } from '@/utils/mockData'
import { IAssignee } from '@/types/interfaces'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'

export const NewTaskForm = ({ handleCreate }: { handleCreate: Function }) => {
  const { workflowStates } = useSelector(selectTaskBoard)

  const { renderingItem: statusValue, updateRenderingItem: updateStatusValue } = useHandleSelectorComponent({
    item: workflowStates[0],
  })
  const { renderingItem: assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item: assignee[0],
  })

  console.log('ssssss', statusValue)

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
            }}
            startIcon={statusIcons[(statusValue as WorkflowStateResponse).type]}
            options={workflowStates}
            value={statusValue}
            selectorType={SelectorType.STATUS_SELECTOR}
            buttonContent={
              <Typography variant="bodySm" lineHeight="16px" sx={{ color: (theme) => theme.color.gray[600] }}>
                {(statusValue as WorkflowStateResponse).name as ReactNode}
              </Typography>
            }
          />
          <Stack alignSelf="flex-start">
            <Selector
              getSelectedValue={(newValue) => {
                updateAssigneeValue(newValue as IAssignee)
              }}
              startIcon={
                <Avatar alt="user" src={(assigneeValue as IAssignee)?.img} sx={{ width: '20px', height: '20px' }} />
              }
              options={assignee}
              value={assigneeValue}
              selectorType={SelectorType.ASSIGNEE_SELECTOR}
              buttonContent={
                <Typography variant="bodySm" lineHeight="16px" sx={{ color: (theme) => theme.color.gray[600] }}>
                  {(assigneeValue as IAssignee)?.name || 'No Assignee'}
                </Typography>
              }
            />
          </Stack>
        </Stack>
      </AppMargin>
      <NewTaskFooter />
    </NewTaskContainer>
  )
}

const NewTaskFormInputs = () => {
  return (
    <>
      <Stack direction="column" rowGap={1}>
        <Typography variant="md">Task name</Typography>
        <StyledTextField type="text" padding="8px 0px" />
      </Stack>
      <Stack direction="column" rowGap={1} m="16px 0px">
        <Typography variant="md">Description</Typography>
        <StyledTextField
          type="text"
          placeholder="Add description..."
          multiline
          rows={6}
          inputProps={{ style: { resize: 'vertical' } }}
        />
      </Stack>
    </>
  )
}

const NewTaskFooter = () => {
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
            <PrimaryBtn handleClick={() => {}} buttonText="Create" />
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
