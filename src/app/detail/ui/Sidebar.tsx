'use client'

import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { Avatar, Box, Stack, Typography, styled } from '@mui/material'
import Selector, { SelectorType } from '@/components/inputs/Selector'
import { assignee } from '@/utils/mockData'
import { IAssignee } from '@/types/interfaces'
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
  updateWorkflowState,
}: {
  selectedWorkflowState: WorkflowStateResponse
  updateWorkflowState: (workflowState: WorkflowStateResponse) => void
}) => {
  const { workflowStates } = useSelector(selectTaskBoard)

  const { renderingItem: statusValue, updateRenderingItem: updateStatusValue } = useHandleSelectorComponent({
    // item: workflowStates[0],
    item: selectedWorkflowState,
    type: SelectorType.STATUS_SELECTOR,
  })
  const { renderingItem: assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item: assignee[0],
    type: SelectorType.ASSIGNEE_SELECTOR,
  })

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
              // store.dispatch(setCreateTaskFields({ targetField: 'workflowStateId', value: (newValue as WorkflowStateResponse).id }))
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
        </Stack>
        <Stack direction="row" m="16px 0px" alignItems="center">
          <StyledText variant="md">Assignee</StyledText>
          <Selector
            getSelectedValue={(newValue) => {
              updateAssigneeValue(newValue as IAssignee)
            }}
            startIcon={<Avatar alt="user" src={(assigneeValue as IAssignee).img} sx={{ width: '20px', height: '20px' }} />}
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
