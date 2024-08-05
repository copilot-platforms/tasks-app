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
import { UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { createDateFromFormattedDateString, formatDate } from '@/utils/dateHelper'
import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { ToggleButtonContainer } from './ToggleButtonContainer'
import { NoAssignee } from '@/utils/noAssignee'
import { WorkflowStateSelector } from '@/components/inputs/Selector-WorkflowState'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { AssigneePlaceholder } from '@/icons'
import { useEffect, useState } from 'react'
import { setDebouncedFilteredAssignees } from '@/utils/users'
import { z } from 'zod'
import { getAssigneeName, isAssigneeTextMatching } from '@/utils/assignee'
import { DateStringSchema } from '@/types/date'

const StyledText = styled(Typography)(({ theme }) => ({
  color: theme.color.gray[500],
  width: '80px',
}))

export const Sidebar = ({
  task_id,
  updateWorkflowState,
  updateAssignee,
  updateTask,
  assignee,
  disabled,
  workflowDisabled,
}: {
  task_id: string
  selectedWorkflowState: WorkflowStateResponse
  selectedAssigneeId: string | undefined
  updateWorkflowState: (workflowState: WorkflowStateResponse) => void
  updateAssignee: (assigneeType: string | null, assigneeId: string | null) => void
  updateTask: (payload: UpdateTaskRequest) => void
  assignee: IAssigneeCombined[]
  disabled: boolean
  workflowDisabled?: false
}) => {
  const { tasks, token, workflowStates } = useSelector(selectTaskBoard)
  const { showSidebar } = useSelector(selectTaskDetails)
  const [filteredAssignees, setFilteredAssignees] = useState(assignee)
  const [activeDebounceTimeoutId, setActiveDebounceTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState(false)
  const [dueDate, setDueDate] = useState<Date | string | undefined>()

  const { renderingItem: _statusValue, updateRenderingItem: updateStatusValue } = useHandleSelectorComponent({
    // item: selectedWorkflowState,
    item: null,
    type: SelectorType.STATUS_SELECTOR,
  })
  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    // item: selectedAssigneeId ? assignee.find((el) => el.id === selectedAssigneeId) : NoAssignee,
    item: null,
    type: SelectorType.ASSIGNEE_SELECTOR,
  })

  const statusValue = _statusValue as WorkflowStateResponse //typecasting
  const assigneeValue = _assigneeValue as IAssigneeCombined //typecasting

  useEffect(() => {
    if (tasks && workflowStates) {
      const currentTask = tasks.find((el) => el.id === task_id)
      const currentWorkflowState = workflowStates.find((el) => el?.id === currentTask?.workflowStateId)
      const currentAssigneeId = currentTask?.assigneeId
      console.log('assigneeId>>', currentAssigneeId)
      const currentAssignee = currentAssigneeId ? assignee.find((el) => el.id === currentAssigneeId) : NoAssignee
      console.log('current>>', currentAssignee)
      updateStatusValue(currentWorkflowState)
      updateAssigneeValue(currentAssignee)
      setDueDate(currentTask?.dueDate)
    }
  }, [tasks, workflowStates])
  console.log('assignee', assigneeValue)

  const matches = useMediaQuery('(max-width:600px)')
  if (!tasks) return null

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
            disabled={workflowDisabled}
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
                <CopilotAvatar currentAssignee={assigneeValue} />
              )
            }
            options={loading ? [] : filteredAssignees}
            value={assigneeValue?.name == 'No assignee' ? null : assigneeValue}
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
                  : getAssigneeName(assigneeValue, 'Unassigned')}
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
            Due date
          </StyledText>
          <DatePickerComponent
            getDate={(date) => {
              const isoDate = DateStringSchema.parse(formatDate(date))
              updateTask({
                dueDate: isoDate,
              })
            }}
            dateValue={dueDate ? createDateFromFormattedDateString(z.string().parse(dueDate)) : undefined}
            disabled={disabled}
          />
        </Stack>
      </AppMargin>
    </Box>
  )
}
