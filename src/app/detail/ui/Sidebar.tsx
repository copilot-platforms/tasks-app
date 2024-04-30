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

const StyledText = styled(Typography)(({ theme }) => ({
  color: theme.color.gray[500],
  width: '80px',
}))

export const Sidebar = ({
  selectedWorkflowState,
  selectedAssigneeId,
  updateWorkflowState,
  updateAssignee,
  assignee,
}: {
  selectedWorkflowState: WorkflowStateResponse
  selectedAssigneeId: string | undefined
  updateWorkflowState: (workflowState: WorkflowStateResponse) => void
  updateAssignee: (assigneeType: string, assigneeId: string) => void
  assignee: IAssigneeCombined[]
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

  return (
    <Box
      sx={{
        borderLeft: (theme) => `1px solid ${theme.color.borders.border2}`,
        height: '91vh',
      }}
    >
      <AppMargin size={SizeofAppMargin.SMALL} py="31px">
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
          />
        </Stack>
        <Stack direction="row" m="16px 0px" alignItems="center">
          <StyledText variant="md">Assignee</StyledText>
          <Selector
            getSelectedValue={(newValue) => {
              const assignee = newValue as IAssigneeCombined
              updateAssigneeValue(assignee)
              const assigneeType =
                assignee?.type === 'internalUsers'
                  ? 'internalUser'
                  : assignee?.type === 'clients'
                    ? 'client'
                    : assignee?.type === 'companies'
                      ? 'company'
                      : ''
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
          />
        </Stack>
        <Stack direction="row" m="16px 0px" alignItems="center">
          <StyledText variant="md">Due Date</StyledText>
          <DatePickerComponent
            getDate={(date) => {
              console.log(date)
            }}
            dateValue="Apr 05, 2024"
          />
        </Stack>
      </AppMargin>
    </Box>
  )
}
