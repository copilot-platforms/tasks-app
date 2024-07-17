'use client'

import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { Box, Stack, Typography, styled, useMediaQuery } from '@mui/material'
import Selector, { SelectorType } from '@/components/inputs/Selector'
import { IAssigneeCombined } from '@/types/interfaces'
import { DatePickerComponent } from '@/components/inputs/DatePickerComponent'
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
import { WorkflowStateSelector } from '@/components/inputs/Selector-WorkflowState'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { AssigneePlaceholder } from '@/icons'
import { useState } from 'react'
import { MiniLoader } from '@/components/atoms/MiniLoader'
import { setDebouncedFilteredAssignees } from '@/utils/users'
import { z } from 'zod'
import { truncateText } from '@/utils/truncateText'
import { TruncateMaxNumber } from '@/types/constants'
import { isAssigneeTextMatching } from '@/utils/assignee'

const StyledText = styled(Typography)(({ theme }) => ({
  color: theme.color.gray[500],
  width: '80px',
}))

export const Sidebar = ({
  task_id,
  selectedWorkflowState,
  selectedAssigneeId,
  updateWorkflowState,
  dueDate,
  updateAssignee,
  updateTask,
  assignee,
  disabled,
}: {
  task_id: string
  selectedWorkflowState: WorkflowStateResponse
  selectedAssigneeId: string | undefined
  dueDate: IsoDate | undefined
  updateWorkflowState: (workflowState: WorkflowStateResponse) => void
  updateAssignee: (assigneeType: string | null, assigneeId: string | null) => void
  updateTask: (payload: UpdateTaskRequest) => void
  assignee: IAssigneeCombined[]
  disabled: boolean
}) => {
  const { workflowStates, token, tasks } = useSelector(selectTaskBoard)
  const currentTask = tasks.find((el) => el.id === task_id)
  const { showSidebar } = useSelector(selectTaskDetails)
  const [filteredAssignees, setFilteredAssignees] = useState(assignee)
  const [activeDebounceTimeoutId, setActiveDebounceTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState(false)

  const { renderingItem: _statusValue, updateRenderingItem: updateStatusValue } = useHandleSelectorComponent({
    item: currentTask?.workflowStateId,
    type: SelectorType.STATUS_SELECTOR,
  })
  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    item: currentTask?.assigneeId ? assignee.find((el) => el.id === currentTask?.assigneeId) : NoAssignee,
    type: SelectorType.ASSIGNEE_SELECTOR,
  })

  const statusValue = _statusValue as WorkflowStateResponse //typecasting
  const assigneeValue = _assigneeValue as IAssigneeCombined //typecasting

  const matches = useMediaQuery('(max-width:600px)')

  return (
    <Box
      sx={{
        borderLeft: (theme) => `1px solid ${theme.color.borders.border2}`,
        height: '100vh',
        display: showSidebar ? 'block' : 'none',
        width: matches && showSidebar ? '100vw' : '25vw',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <StyledBox p="20px 20px" display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="sm">Properties</Typography>
          <Box
            sx={{
              display: matches ? 'block' : 'none',
            }}
          >
            <ToggleButtonContainer />
          </Box>
        </StyledBox>
      </Stack>
      <AppMargin size={SizeofAppMargin.SMALL}>
        <Stack direction="row" alignItems="center" m="20px 0px" columnGap="10px">
          <StyledText variant="md" minWidth="80px">
            Status
          </StyledText>
          <WorkflowStateSelector
            option={workflowStates}
            value={statusValue}
            getValue={(value) => {
              updateStatusValue(value)
              updateWorkflowState(value)
            }}
            disabled={disabled}
            disableOutline
            responsiveNoHide
          />
        </Stack>
        <Stack direction="row" m="20px 0px" alignItems="center" columnGap="10px">
          <StyledText variant="md" minWidth="80px">
            Assignee
          </StyledText>
          <Selector
            buttonWidth="100%"
            placeholder="Change assignee"
            getSelectedValue={(newValue) => {
              const assignee = newValue as IAssigneeCombined
              updateAssigneeValue(assignee)
              const assigneeType = getAssigneeTypeCorrected(assignee)
              updateAssignee(assigneeType, assignee?.id)
            }}
            startIcon={
              (assigneeValue as IAssigneeCombined)?.name == 'No assignee' ? (
                <AssigneePlaceholder />
              ) : (
                <CopilotAvatar currentAssignee={assigneeValue} height="16px" width="16px" fontSize="11px" />
              )
            }
            options={loading ? [] : filteredAssignees}
            value={assigneeValue.name == 'No assignee' ? null : assigneeValue}
            selectorType={SelectorType.ASSIGNEE_SELECTOR}
            //****Disabling re-assignment completely for now***
            // extraOption={NoAssigneeExtraOptions}
            // extraOptionRenderer={(setAnchorEl, anchorEl, props) => {
            //   return (
            //     <>
            //       <ExtraOptionRendererAssignee
            //         props={props}
            //         onClick={(e) => {
            //           updateAssigneeValue({ id: '', name: 'No assignee' })
            //           setAnchorEl(anchorEl ? null : e.currentTarget)
            //           updateAssignee(null, null)
            //         }}
            //       />
            //       {loading && <MiniLoader />}
            //     </>
            //   )
            // }}
            buttonContent={
              <Typography variant="md" lineHeight="22px" sx={{ color: (theme) => theme.color.gray[600] }}>
                {(assigneeValue as IAssigneeCombined)?.name == 'No assignee'
                  ? 'Unassigned'
                  : (assigneeValue as IAssigneeCombined)?.name ||
                    `${(assigneeValue as IAssigneeCombined)?.givenName ?? ''} ${(assigneeValue as IAssigneeCombined)?.familyName ?? ''}`.trim()}
              </Typography>
            }
            handleInputChange={async (newInputValue: string) => {
              if (!newInputValue || isAssigneeTextMatching(newInputValue, assigneeValue)) {
                setFilteredAssignees(assignee)
                return
              }

              setDebouncedFilteredAssignees(
                activeDebounceTimeoutId,
                setActiveDebounceTimeoutId,
                setLoading,
                setFilteredAssignees,
                z.string().parse(token),
                newInputValue,
              )
            }}
            filterOption={(x: unknown) => x}
            // disabled={disabled}
            disabled={true} //for now, disable re-assignment completely
            disableOutline
            responsiveNoHide
          />
        </Stack>
        <Stack direction="row" m="20px 0px" alignItems="center" columnGap="10px" minWidth="fit-content">
          <StyledText variant="md" minWidth="80px">
            Due Date
          </StyledText>
          <DatePickerComponent
            getDate={(date) => {
              const isoDate = formatDate(date)
              updateTask({
                dueDate: isoDate,
              })
            }}
            dateValue={currentTask?.dueDate ? isoToReadableDate(currentTask.dueDate) : undefined}
            disabled={disabled}
          />
        </Stack>
      </AppMargin>
    </Box>
  )
}
