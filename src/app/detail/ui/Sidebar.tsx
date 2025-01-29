'use client'

import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { Box, Skeleton, Stack, Typography, styled, useMediaQuery } from '@mui/material'
import Selector, { SelectorType } from '@/components/inputs/Selector'
import { IAssigneeCombined, Sizes } from '@/types/interfaces'
import { DatePickerComponent } from '@/components/inputs/DatePickerComponent'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { StyledBox, StyledModal } from './styledComponent'
import { getAssigneeTypeCorrected } from '@/utils/getAssigneeTypeCorrected'
import { UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { createDateFromFormattedDateString, formatDate } from '@/utils/dateHelper'
import { selectTaskDetails, toggleShowConfirmAssignModal, setShowSidebar } from '@/redux/features/taskDetailsSlice'
import { ToggleButtonContainer } from './ToggleButtonContainer'
import { NoAssignee, NoAssigneeExtraOptions, NoDataFoundOption } from '@/utils/noAssignee'
import { WorkflowStateSelector } from '@/components/inputs/Selector-WorkflowState'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { AssigneePlaceholder } from '@/icons'
import { useEffect, useState } from 'react'
import { setDebouncedFilteredAssignees } from '@/utils/users'
import { z } from 'zod'
import { getAssigneeName, isAssigneeTextMatching } from '@/utils/assignee'
import { DateStringSchema } from '@/types/date'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import store from '@/redux/store'
import { ConfirmUI } from '@/components/layouts/ConfirmUI'
import { ShouldConfirmBeforeReassignment } from '@/utils/shouldConfirmBeforeReassign'
import { MiniLoader } from '@/components/atoms/MiniLoader'
import { useSWRConfig } from 'swr'

const StyledText = styled(Typography)(({ theme }) => ({
  color: theme.color.gray[500],
  width: '80px',
}))

export const Sidebar = ({
  task_id,
  updateWorkflowState,
  updateAssignee,
  updateTask,
  disabled,
  workflowDisabled,
}: {
  task_id: string
  selectedWorkflowState: WorkflowStateResponse
  selectedAssigneeId: string | undefined
  updateWorkflowState: (workflowState: WorkflowStateResponse) => void
  updateAssignee: (assigneeType: string | null, assigneeId: string | null) => void
  updateTask: (payload: UpdateTaskRequest) => void
  disabled: boolean
  workflowDisabled?: false
}) => {
  const { activeTask, token, workflowStates, assignee, previewMode } = useSelector(selectTaskBoard)
  const { showSidebar, showConfirmAssignModal } = useSelector(selectTaskDetails)
  const [filteredAssignees, setFilteredAssignees] = useState(assignee)
  const [activeDebounceTimeoutId, setActiveDebounceTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState(false)
  const [dueDate, setDueDate] = useState<Date | string | undefined>()
  const [inputStatusValue, setInputStatusValue] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState<IAssigneeCombined | undefined>(undefined)

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
    if (activeTask && workflowStates) {
      const currentTask = activeTask

      const currentWorkflowState = workflowStates.find((el) => el?.id === currentTask?.workflowStateId)
      const currentAssigneeId = currentTask?.assigneeId
      updateStatusValue(currentWorkflowState)
      updateAssigneeValue(currentAssigneeId ? assignee.find((el) => el.id === currentAssigneeId) : NoAssignee)
      setDueDate(currentTask?.dueDate)
    }
  }, [activeTask, workflowStates])

  const windowWidth = useWindowWidth()
  const isMobile = windowWidth < 600 && windowWidth !== 0

  const handleAssigneeChange = (assigneeValue: IAssigneeCombined) => {
    updateAssigneeValue(assigneeValue)
    // const assigneeType = getAssigneeTypeCorrected(assigneeValue)
    // updateAssignee(assigneeType, assigneeValue?.id)
    handleChangeAssignee(assigneeValue)
  }

  const handleConfirmAssigneeChange = (assigneeValue: IAssigneeCombined) => {
    handleAssigneeChange(assigneeValue)
    store.dispatch(toggleShowConfirmAssignModal())
  }

  const handleChangeAssignee = async (assignee: IAssigneeCombined) => {
    try {
      await fetch(`/api/tasks/${task_id}?token=${token}`, {
        method: 'PATCH',
        body: JSON.stringify({
          assigneeType: getAssigneeTypeCorrected(assignee),
          assigneeId: assignee.id,
        }),
      })
    } catch (error) {
      console.error('Failed to change assignee:', error)
    }
  } //Right now this function is being used instead of server actions. Server actions are of blocking behaviour which causes other consecutive server actions on hold if the previous actions takes time. handling assignee change on server actions takes too much time because of notification if an assignee is a company.

  useEffect(() => {
    if (isMobile) {
      store.dispatch(setShowSidebar(false))
    }
  }, [isMobile])

  if (!activeTask) return <SidebarSkeleton />
  if (!showSidebar) {
    return (
      <Stack
        direction="row"
        columnGap={'8px'}
        rowGap={'8px'}
        position="relative"
        sx={{ flexWrap: 'wrap', padding: '12px 18px' }}
      >
        <Box
          sx={{
            borderRadius: '4px',
            width: 'fit-content',
          }}
        >
          <WorkflowStateSelector
            option={workflowStates}
            value={statusValue}
            getValue={(value) => {
              updateStatusValue(value)
              updateWorkflowState(value)
            }}
            responsiveNoHide
            disabled={workflowDisabled}
            size={Sizes.LARGE}
            padding={'3px 8px'}
          />
        </Box>
        <Box
          sx={{
            borderRadius: '4px',
            width: 'fit-content',
          }}
        >
          <Selector
            inputStatusValue={inputStatusValue}
            setInputStatusValue={setInputStatusValue}
            buttonWidth="100%"
            padding={'3px 8px'}
            placeholder="Set assignee"
            getSelectedValue={(newValue) => {
              const assignee = newValue as IAssigneeCombined
              const shouldShowConfirmModal = ShouldConfirmBeforeReassignment(assigneeValue, assignee)
              if (shouldShowConfirmModal) {
                setSelectedAssignee(assignee)
                store.dispatch(toggleShowConfirmAssignModal())
              } else {
                handleAssigneeChange(assignee)
              }
            }}
            startIcon={
              (assigneeValue as IAssigneeCombined)?.name == 'No assignee' ? (
                <AssigneePlaceholder />
              ) : (
                <CopilotAvatar currentAssignee={assigneeValue} />
              )
            }
            options={loading ? [] : filteredAssignees.length ? filteredAssignees : [NoDataFoundOption]}
            value={assigneeValue?.name == 'No assignee' ? null : assigneeValue}
            selectorType={SelectorType.ASSIGNEE_SELECTOR}
            buttonHeight="auto"
            buttonContent={
              <Typography
                variant="md"
                lineHeight="22px"
                sx={{
                  color: (theme) => theme.color.gray[600],
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  maxWidth: '150px',
                }}
              >
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
            extraOption={NoAssigneeExtraOptions}
            extraOptionRenderer={(setAnchorEl, anchorEl, props) => {
              return (
                <>
                  {/* <ExtraOptionRendererAssignee
                    props={props}
                    onClick={(e) => {
                      updateAssigneeValue({ id: '', name: 'No assignee' })
                      setAnchorEl(anchorEl ? null : e.currentTarget)
                      updateAssignee(null, null)
                    }}
                  /> */}
                  {loading && <MiniLoader />}
                </>
              )
            }}
            disabled={disabled}
            cursor="default"
            filterOption={(x: unknown) => x}
            responsiveNoHide
            currentOption={assigneeValue}
          />
        </Box>
        <Box sx={{}}>
          <DatePickerComponent
            getDate={(date) => {
              const isoDate = DateStringSchema.parse(formatDate(date))
              updateTask({
                dueDate: isoDate,
              })
            }}
            dateValue={dueDate ? createDateFromFormattedDateString(z.string().parse(dueDate)) : undefined}
            disabled={disabled && !previewMode}
            isButton={true}
            size={Sizes.MEDIUM}
            padding={'3px 8px'}
          />
        </Box>
        <StyledModal
          open={showConfirmAssignModal}
          onClose={() => store.dispatch(toggleShowConfirmAssignModal())}
          aria-labelledby="confirm-reassignment-modal"
          aria-describedby="confirm-reassignment"
        >
          <ConfirmUI
            handleCancel={() => {
              setSelectedAssignee(undefined)
              store.dispatch(toggleShowConfirmAssignModal())
            }}
            handleConfirm={() => {
              if (selectedAssignee) {
                handleConfirmAssigneeChange(selectedAssignee)
              }
            }}
            buttonText="Reassign"
            description={`You're about to reassign this task from ${getAssigneeName(assigneeValue)} to ${getAssigneeName(selectedAssignee)}. This will give ${getAssigneeName(selectedAssignee)} access to all task comments and history.`}
            title="Reassign task?"
          />
        </StyledModal>
      </Stack>
    )
  }

  return (
    <Box
      sx={{
        borderLeft: (theme) => `1px solid ${theme.color.borders.border2}`,
        height: '100vh',
        display: showSidebar ? 'block' : 'none',
        width: isMobile && showSidebar ? '100vw' : '25vw',
      }}
    >
      <StyledBox>
        <AppMargin size={SizeofAppMargin.HEADER} py="17.5px">
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ height: '28px' }}>
            <Typography variant="sm" lineHeight={'21px'} fontSize={'13px'}>
              Properties
            </Typography>
          </Stack>
        </AppMargin>
      </StyledBox>

      <AppMargin size={SizeofAppMargin.HEADER} py={'4px'}>
        <Stack direction="row" alignItems="center" m="4px 0px" columnGap="10px">
          <StyledText variant="md" minWidth="80px">
            Status
          </StyledText>
          <Box
            sx={{
              ':hover': {
                bgcolor: (theme) => theme.color.background.bgCallout,
              },
              padding: '4px',
              borderRadius: '4px',
              width: 'fit-content',
            }}
          >
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
          </Box>
        </Stack>
        <Stack direction="row" m="8px 0px" alignItems="center" columnGap="10px">
          <StyledText variant="md" minWidth="80px">
            Assignee
          </StyledText>
          <Box
            sx={{
              ':hover': {
                // bgcolor: (theme) => theme.color.background.bgCallout,
              },
              padding: '4px',
              borderRadius: '4px',
              width: 'fit-content',
            }}
          >
            <Selector
              inputStatusValue={inputStatusValue}
              setInputStatusValue={setInputStatusValue}
              buttonWidth="100%"
              placeholder="Set assignee"
              getSelectedValue={(newValue) => {
                const assignee = newValue as IAssigneeCombined
                const shouldShowConfirmModal = ShouldConfirmBeforeReassignment(assigneeValue, assignee)
                if (shouldShowConfirmModal) {
                  setSelectedAssignee(assignee)
                  store.dispatch(toggleShowConfirmAssignModal())
                } else {
                  handleAssigneeChange(assignee)
                }
              }}
              startIcon={
                (assigneeValue as IAssigneeCombined)?.name == 'No assignee' ? (
                  <AssigneePlaceholder />
                ) : (
                  <CopilotAvatar currentAssignee={assigneeValue} />
                )
              }
              options={loading ? [] : filteredAssignees.length ? filteredAssignees : [NoDataFoundOption]}
              value={assigneeValue?.name == 'No assignee' ? null : assigneeValue}
              selectorType={SelectorType.ASSIGNEE_SELECTOR}
              //****Disabling re-assignment completely for now***
              extraOption={NoAssigneeExtraOptions}
              extraOptionRenderer={(setAnchorEl, anchorEl, props) => {
                return (
                  <>
                    {/* <ExtraOptionRendererAssignee
                      props={props}
                      onClick={(e) => {
                        updateAssigneeValue({ id: '', name: 'No assignee' })
                        setAnchorEl(anchorEl ? null : e.currentTarget)
                        updateAssignee(null, null)
                      }}
                    /> */}
                    {loading && <MiniLoader />}
                  </>
                )
              }}
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
              disabled={disabled}
              cursor={'default'}
              disableOutline
              responsiveNoHide
              currentOption={assigneeValue}
            />
          </Box>
        </Stack>
        <Stack direction="row" m="8px 0px" alignItems="center" columnGap="10px" minWidth="fit-content">
          <StyledText variant="md" minWidth="80px">
            Due date
          </StyledText>
          <Box
            sx={{
              ':hover': {
                bgcolor: (theme) => (!!disabled && !previewMode ? '' : theme.color.background.bgCallout),
              },
              padding: '4px',
              borderRadius: '4px',
              width: 'fit-content',
            }}
          >
            <DatePickerComponent
              getDate={(date) => {
                const isoDate = DateStringSchema.parse(formatDate(date))
                updateTask({
                  dueDate: isoDate,
                })
              }}
              dateValue={dueDate ? createDateFromFormattedDateString(z.string().parse(dueDate)) : undefined}
              disabled={disabled && !previewMode}
            />
          </Box>
        </Stack>
      </AppMargin>
      <StyledModal
        open={showConfirmAssignModal}
        onClose={() => store.dispatch(toggleShowConfirmAssignModal())}
        aria-labelledby="confirm-reassignment-modal"
        aria-describedby="confirm-reassignment"
      >
        <ConfirmUI
          handleCancel={() => {
            setSelectedAssignee(undefined)
            store.dispatch(toggleShowConfirmAssignModal())
          }}
          handleConfirm={() => {
            if (selectedAssignee) {
              handleConfirmAssigneeChange(selectedAssignee)
            }
          }}
          buttonText="Reassign"
          description={`You're about to reassign this task from ${getAssigneeName(assigneeValue)} to ${getAssigneeName(selectedAssignee)}. This will give ${getAssigneeName(selectedAssignee)} access to all task comments and history.`}
          title="Reassign task?"
        />
      </StyledModal>
    </Box>
  )
}

export const SidebarSkeleton = () => {
  const { showSidebar } = useSelector(selectTaskDetails)
  const windowWidth = useWindowWidth()
  const isMobile = windowWidth < 600 && windowWidth !== 0

  useEffect(() => {
    if (isMobile) {
      store.dispatch(setShowSidebar(false))
    } else {
      store.dispatch(setShowSidebar(true))
    }
  }, [isMobile])

  if (isMobile) {
    return (
      <Stack
        direction="row"
        columnGap={'8px'}
        rowGap={'8px'}
        position="relative"
        sx={{ flexWrap: 'wrap', padding: '12px 18px' }}
      >
        <Box sx={{ height: '30px', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
          <Skeleton variant="rectangular" width={120} height={15} />
        </Box>
        <Box sx={{ height: '30px', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
          <Skeleton variant="rectangular" width={120} height={15} />
        </Box>

        <Box sx={{ height: '30px', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
          <Skeleton variant="rectangular" width={120} height={15} />
        </Box>
      </Stack>
    )
  }
  return (
    <Box
      sx={{
        borderLeft: (theme) => `1px solid ${theme.color.borders.border2}`,
        height: '100vh',
        display: showSidebar ? 'block' : 'none',
        width: isMobile && showSidebar ? '100vw' : '25vw',
      }}
    >
      <StyledBox>
        <AppMargin size={SizeofAppMargin.HEADER} py="17.5px">
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ height: '28px' }}>
            <Typography variant="sm" lineHeight={'21px'} fontSize={'13px'}>
              Properties
            </Typography>
          </Stack>
        </AppMargin>
      </StyledBox>

      <AppMargin size={SizeofAppMargin.HEADER} py={'4px'}>
        <Stack direction="row" alignItems="center" m="4px 0px" columnGap="10px">
          <StyledText variant="md" minWidth="80px">
            Status
          </StyledText>
          <Box sx={{ height: '38px', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
            <Skeleton variant="rectangular" width={120} height={15} />
          </Box>
        </Stack>
        <Stack direction="row" m="8px 0px" alignItems="center" columnGap="10px">
          <StyledText variant="md" minWidth="80px">
            Assignee
          </StyledText>
          <Box sx={{ height: '38px', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
            <Skeleton variant="rectangular" width={120} height={15} />
          </Box>
        </Stack>
        <Stack direction="row" m="8x 0px" alignItems="center" columnGap="10px" minWidth="fit-content">
          <StyledText variant="md" minWidth="80px">
            Due date
          </StyledText>
          <Box sx={{ height: '40px', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
            <Skeleton variant="rectangular" width={120} height={15} />
          </Box>
        </Stack>
      </AppMargin>
    </Box>
  )
}
