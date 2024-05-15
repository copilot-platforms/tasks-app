'use client'

import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { Avatar, Box, Stack, Typography, styled } from '@mui/material'
import Selector, { SelectorType } from '@/components/inputs/Selector'
import { IAssigneeCombined } from '@/types/interfaces'
import { statusIcons } from '@/utils/iconMatcher'
import { DatePickerComponent } from '@/components/inputs/DatePickerComponent'
import { ReactNode } from 'react'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { StyledBox } from './styledComponent'
import { getAssigneeTypeCorrected } from '@/utils/getAssigneeTypeCorrected'
import { UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { formatDate, isoToReadableDate } from '@/utils/dateHelper'

const StyledText = styled(Typography)(({ theme }) => ({
  color: theme.color.gray[500],
  width: '80px',
}))

export const Sidebar = ({
  selectedWorkflowState,
  selectedAssigneeId,
  updateWorkflowState,
  dueDate,
  updateAssignee,
  updateTask,
  assignee,
  disabled,
}: {
  selectedWorkflowState: WorkflowStateResponse
  selectedAssigneeId: string | undefined
  dueDate: string | undefined
  updateWorkflowState: (workflowState: WorkflowStateResponse) => void
  updateAssignee: (assigneeType: string, assigneeId: string) => void
  updateTask: (payload: UpdateTaskRequest) => void
  assignee: IAssigneeCombined[]
  disabled: boolean
}) => {
  const { workflowStates } = useSelector(selectTaskBoard)

  const { renderingItem: _statusValue, updateRenderingItem: updateStatusValue } = useHandleSelectorComponent({
    item: selectedWorkflowState,
    type: SelectorType.STATUS_SELECTOR,
  })
  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item: selectedAssigneeId ? assignee.find((el) => el.id === selectedAssigneeId) : assignee[0],
    type: SelectorType.ASSIGNEE_SELECTOR,
  })

  const statusValue = _statusValue as WorkflowStateResponse //typecasting
  const assigneeValue = _assigneeValue as IAssigneeCombined //typecasting

  console.log(isoToReadableDate(dueDate || ''))

  return (
    <Box
      sx={{
        borderLeft: (theme) => `1px solid ${theme.color.borders.border2}`,
        height: '91vh',
      }}
    >
      <StyledBox p="19px 25px">
        <Typography variant="sm">Properties</Typography>
      </StyledBox>
      <AppMargin size={SizeofAppMargin.SMALL}>
        <Stack direction="row" alignItems="center" m="16px 0px">
          <StyledText variant="md">Status</StyledText>
          <Selector
            getSelectedValue={(newValue) => {
              updateStatusValue(newValue)
              updateWorkflowState(newValue as WorkflowStateResponse)
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
            disabled={disabled}
          />
        </Stack>
        <Stack direction="row" m="16px 0px" alignItems="center">
          <StyledText variant="md">Assignee</StyledText>
          <Selector
            getSelectedValue={(newValue) => {
              const assignee = newValue as IAssigneeCombined
              updateAssigneeValue(assignee)
              const assigneeType = getAssigneeTypeCorrected(assignee)
              updateAssignee(assigneeType, assignee?.id)
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
            disabled={disabled}
          />
        </Stack>
        <Stack direction="row" m="16px 0px" alignItems="center">
          <StyledText variant="md">Due Date</StyledText>
          <DatePickerComponent
            getDate={(date) => {
              const isoDate = formatDate(date)
              updateTask({
                dueDate: isoDate,
              })
            }}
            dateValue={dueDate ? isoToReadableDate(dueDate) : undefined}
          />
        </Stack>
      </AppMargin>
    </Box>
  )
}
