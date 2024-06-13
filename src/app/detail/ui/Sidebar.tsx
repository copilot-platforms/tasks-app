'use client'

import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { Avatar, Box, Stack, Typography, styled, useMediaQuery } from '@mui/material'
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
import { IsoDate, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { formatDate, isoToReadableDate } from '@/utils/dateHelper'
import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { ToggleButtonContainer } from './ToggleButtonContainer'
import { NoAssignee, NoAssigneeExtraOptions } from '@/utils/noAssignee'
import ExtraOptionRendererAssignee from '@/components/inputs/ExtraOptionRendererAssignee'
import AvatarWithInitials from '@/components/Avatar/AvatarWithInitials'

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
  dueDate: IsoDate | undefined
  updateWorkflowState: (workflowState: WorkflowStateResponse) => void
  updateAssignee: (assigneeType: string | null, assigneeId: string | null) => void
  updateTask: (payload: UpdateTaskRequest) => void
  assignee: IAssigneeCombined[]
  disabled: boolean
}) => {
  const { workflowStates } = useSelector(selectTaskBoard)
  const { showSidebar } = useSelector(selectTaskDetails)

  const { renderingItem: _statusValue, updateRenderingItem: updateStatusValue } = useHandleSelectorComponent({
    item: selectedWorkflowState,
    type: SelectorType.STATUS_SELECTOR,
  })
  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item: selectedAssigneeId ? assignee.find((el) => el.id === selectedAssigneeId) : NoAssignee,
    type: SelectorType.ASSIGNEE_SELECTOR,
  })

  const statusValue = _statusValue as WorkflowStateResponse //typecasting
  const assigneeValue = _assigneeValue as IAssigneeCombined //typecasting

  const matches = useMediaQuery('(max-width:600px)')

  return (
    <Box
      sx={{
        borderLeft: (theme) => `1px solid ${theme.color.borders.border2}`,
        height: '91vh',
        display: showSidebar ? 'block' : 'none',
        width: matches && showSidebar ? '100vw' : '25vw',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" p="19px 25px">
        <StyledBox>
          <Typography variant="sm">Properties</Typography>
        </StyledBox>
        <Box
          sx={{
            display: matches ? 'block' : 'none',
          }}
        >
          <ToggleButtonContainer />
        </Box>
      </Stack>
      <AppMargin size={SizeofAppMargin.SMALL}>
        <Stack
          direction="row"
          alignItems="center"
          m="16px 0px"
          sx={{
            justifyContent: 'space-between',
          }}
        >
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
        <Stack direction="row" m="16px 0px" alignItems="center" justifyContent="space-between">
          <StyledText variant="md">Assignee</StyledText>
          <Selector
            placeholder="Change assignee"
            getSelectedValue={(newValue) => {
              const assignee = newValue as IAssigneeCombined
              updateAssigneeValue(assignee)
              const assigneeType = getAssigneeTypeCorrected(assignee)
              updateAssignee(assigneeType, assignee?.id)
            }}
            startIcon={
              <AvatarWithInitials
                altName={
                  assigneeValue?.familyName || assigneeValue?.givenName == 'No assignee'
                    ? ''
                    : assigneeValue?.familyName || assigneeValue?.givenName
                }
                alt="user"
                src={assigneeValue?.iconImageUrl || assigneeValue?.avatarImageUrl}
                sx={{ width: '20px', height: '20px' }}
                variant={assigneeValue?.type === 'companies' ? 'rounded' : 'circular'}
              />
            }
            options={assignee}
            value={assigneeValue}
            selectorType={SelectorType.ASSIGNEE_SELECTOR}
            extraOption={NoAssigneeExtraOptions}
            extraOptionRenderer={(setAnchorEl, anchorEl, props) => {
              return (
                <ExtraOptionRendererAssignee
                  props={props}
                  onClick={(e) => {
                    updateAssigneeValue({ id: '', name: 'No assignee' })
                    setAnchorEl(anchorEl ? null : e.currentTarget)
                    updateAssignee(null, null)
                  }}
                />
              )
            }}
            buttonContent={
              <Typography variant="bodySm" lineHeight="16px" sx={{ color: (theme) => theme.color.gray[600] }}>
                {assigneeValue?.name || assigneeValue?.givenName}
              </Typography>
            }
            disabled={disabled}
          />
        </Stack>
        <Stack direction="row" m="16px 0px" alignItems="center" justifyContent="space-between">
          <StyledText variant="md">Due Date</StyledText>
          <Box>
            <DatePickerComponent
              getDate={(date) => {
                const isoDate = formatDate(date)
                updateTask({
                  dueDate: isoDate,
                })
              }}
              dateValue={dueDate ? isoToReadableDate(dueDate) : undefined}
            />
          </Box>
        </Stack>
      </AppMargin>
    </Box>
  )
}
