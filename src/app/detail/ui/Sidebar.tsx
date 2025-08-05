'use client'

import { StyledBox, StyledModal } from '@/app/detail/ui/styledComponent'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { SelectorButton } from '@/components/buttons/SelectorButton'
import { CopilotPopSelector } from '@/components/inputs/CopilotSelector'
import { DatePickerComponent } from '@/components/inputs/DatePickerComponent'
import { SelectorType } from '@/components/inputs/Selector'
import { WorkflowStateSelector } from '@/components/inputs/Selector-WorkflowState'
import { ConfirmUI } from '@/components/layouts/ConfirmUI'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { AssigneePlaceholder } from '@/icons'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { selectTaskDetails, setShowSidebar, toggleShowConfirmAssignModal } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'
import { DateStringSchema } from '@/types/date'
import { UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssigneeCombined, InputValue, Sizes, UserType } from '@/types/interfaces'
import { getAssigneeId, getAssigneeName, getUserIds, UserIdsType } from '@/utils/assignee'
import { createDateFromFormattedDateString, formatDate } from '@/utils/dateHelper'
import { getSelectedUserIds, getSelectorAssignee, getSelectorAssigneeFromTask } from '@/utils/selector'
import { NoAssignee } from '@/utils/noAssignee'
import { shouldConfirmBeforeReassignment } from '@/utils/shouldConfirmBeforeReassign'
import { Box, Skeleton, Stack, styled, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { z } from 'zod'
import { ClientDetailAppBridge } from '@/app/detail/ui/ClientDetailAppBridge'

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
  userType,
}: {
  task_id: string
  selectedWorkflowState: WorkflowStateResponse
  selectedAssigneeId: string | undefined
  updateWorkflowState: (workflowState: WorkflowStateResponse) => void
  updateAssignee: (userIds: UserIdsType) => void
  updateTask: (payload: UpdateTaskRequest) => void
  disabled: boolean
  workflowDisabled?: false
  userType: UserType
}) => {
  const { activeTask, workflowStates, assignee, previewMode } = useSelector(selectTaskBoard)
  const { showSidebar, showConfirmAssignModal } = useSelector(selectTaskDetails)

  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const [dueDate, setDueDate] = useState<Date | string | undefined>()

  const [assigneeValue, setAssigneeValue] = useState<IAssigneeCombined | undefined>()

  const [selectedAssignee, setSelectedAssignee] = useState<UserIdsType | undefined>(undefined)

  const { renderingItem: _statusValue, updateRenderingItem: updateStatusValue } = useHandleSelectorComponent({
    // item: selectedWorkflowState,
    item: null,
    type: SelectorType.STATUS_SELECTOR,
  })

  const statusValue = _statusValue as WorkflowStateResponse //typecasting

  const completedWorkflowState = workflowStates.find((state) => state.type === 'completed')

  const isTaskCompleted = activeTask?.workflowStateId === completedWorkflowState?.id

  useEffect(() => {
    if (activeTask && workflowStates && updateStatusValue) {
      const currentTask = activeTask
      const currentWorkflowState = workflowStates.find((el) => el?.id === currentTask?.workflowStateId)
      updateStatusValue(currentWorkflowState)
      setDueDate(currentTask?.dueDate)
    }
  }, [activeTask, workflowStates, updateStatusValue])

  // effect depended on activeTask and assignee to update assigneeValue
  useEffect(() => {
    if (activeTask && assignee.length > 0) {
      const currentAssignee = getSelectorAssigneeFromTask(assignee, activeTask)
      setAssigneeValue(currentAssignee)
    }
  }, [assignee, activeTask])

  const windowWidth = useWindowWidth()
  const isMobile = windowWidth < 600 && windowWidth !== 0

  const handleConfirmAssigneeChange = (userIds: UserIdsType) => {
    updateAssignee(userIds)
    setAssigneeValue(getAssigneeValue(userIds) as IAssigneeCombined)
    store.dispatch(toggleShowConfirmAssignModal())
  }

  useEffect(() => {
    if (isMobile) {
      store.dispatch(setShowSidebar(false))
    }
  }, [isMobile])

  const getAssigneeValue = (userIds?: UserIdsType) => {
    if (!userIds) {
      return NoAssignee
    }
    const assigneeId = getAssigneeId(userIds)
    const match = assignee.find((assignee) =>
      userIds.clientId ? assignee.id === assigneeId && assignee.companyId == userIds.companyId : assignee.id === assigneeId,
    )
    return match ?? undefined
  }

  if (!activeTask || !isHydrated) return <SidebarSkeleton />

  const handleAssigneeChange = (inputValue: InputValue[]) => {
    const newUserIds = getSelectedUserIds(inputValue)
    const previousAssignee = assignee.find((assignee) => assignee.id == getAssigneeId(getUserIds(activeTask)))
    const nextAssignee = getSelectorAssignee(assignee, inputValue)
    const shouldShowConfirmModal = shouldConfirmBeforeReassignment(previousAssignee, nextAssignee)
    if (shouldShowConfirmModal) {
      setSelectedAssignee(newUserIds)
      store.dispatch(toggleShowConfirmAssignModal())
    } else {
      setAssigneeValue(getAssigneeValue(newUserIds) as IAssigneeCombined)
      updateAssignee(newUserIds)
    }
  }

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
            size={Sizes.MEDIUM}
            padding={'3px 8px'}
          />
        </Box>
        <Box
          sx={{
            border: (theme) => `1px solid ${theme.color.borders.border}`,
            borderRadius: '4px',
            width: 'fit-content',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CopilotPopSelector
            name="Set assignee"
            onChange={handleAssigneeChange}
            disabled={disabled}
            initialValue={assigneeValue}
            buttonContent={
              <SelectorButton
                disabled={disabled}
                padding="4px 8px"
                startIcon={<CopilotAvatar currentAssignee={assigneeValue} />}
                outlined={true}
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
                    {assigneeValue?.name == 'No assignee' ? 'Unassigned' : getAssigneeName(assigneeValue, 'Unassigned')}
                  </Typography>
                }
              />
            }
          />
        </Box>
        <Box sx={{}}>
          <DatePickerComponent
            height={'30px'}
            getDate={(date) => {
              const isoDate = DateStringSchema.parse(formatDate(date))
              updateTask({
                dueDate: isoDate,
              })
            }}
            dateValue={dueDate ? createDateFromFormattedDateString(z.string().parse(dueDate)) : undefined}
            disabled={disabled && !previewMode}
            variant="button"
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
            description={
              <>
                You&apos;re about to reassign this task from{' '}
                <strong>{getAssigneeName(getAssigneeValue(getUserIds(activeTask)))}</strong> to{' '}
                <strong>{getAssigneeName(getAssigneeValue(selectedAssignee))}</strong>. This will give{' '}
                <strong>{getAssigneeName(getAssigneeValue(selectedAssignee))}</strong> access to all task comments and
                history.
              </>
            }
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
          {workflowStates.length > 0 && statusValue ? ( // show skelete if statusValue and workflow state list is empty
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
                variant={'normal'}
                responsiveNoHide
              />
            </Box>
          ) : (
            <SidebarElementSkeleton />
          )}
        </Stack>
        <Stack direction="row" m="8px 0px" alignItems="center" columnGap="10px">
          <StyledText variant="md" minWidth="80px">
            Assignee
          </StyledText>
          {assignee.length > 0 ? ( // show skeleton if assignee list is empty
            <Box
              sx={{
                ':hover': {
                  bgcolor: (theme) => (disabled ? 'none' : theme.color.background.bgCallout),
                },
                padding: '4px',
                borderRadius: '4px',
                width: 'fit-content',
              }}
            >
              <CopilotPopSelector
                name="Set assignee"
                onChange={handleAssigneeChange}
                disabled={disabled}
                initialValue={assigneeValue}
                buttonContent={
                  <SelectorButton
                    disabled={disabled}
                    padding="4px 8px"
                    startIcon={<CopilotAvatar currentAssignee={assigneeValue} />}
                    outlined={true}
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
                        {assigneeValue?.name == 'No assignee' ? 'Unassigned' : getAssigneeName(assigneeValue, 'Unassigned')}
                      </Typography>
                    }
                  />
                }
              />
            </Box>
          ) : (
            <SidebarElementSkeleton />
          )}
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
          description={
            <>
              You&apos;re about to reassign this task from{' '}
              <strong>{getAssigneeName(getAssigneeValue(getUserIds(activeTask)))}</strong> to{' '}
              <strong>{getAssigneeName(getAssigneeValue(selectedAssignee))}</strong>. This will give{' '}
              <strong>{getAssigneeName(getAssigneeValue(selectedAssignee))}</strong> access to all task comments and history.
            </>
          }
          title="Reassign task?"
        />
      </StyledModal>
      {userType == UserType.CLIENT_USER && !previewMode && (
        <ClientDetailAppBridge
          isTaskCompleted={isTaskCompleted}
          handleTaskComplete={() => {
            completedWorkflowState && updateStatusValue(completedWorkflowState)
            completedWorkflowState && updateWorkflowState(completedWorkflowState)
          }}
        />
      )}
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
          <Skeleton variant="rectangular" width={140} height={15} />
        </Box>
        <Box sx={{ height: '30px', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
          <Skeleton variant="rectangular" width={140} height={15} />
        </Box>

        <Box sx={{ height: '30px', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
          <Skeleton variant="rectangular" width={140} height={15} />
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

export const SidebarElementSkeleton = () => {
  const windowWidth = useWindowWidth()
  const isMobile = windowWidth < 600 && windowWidth !== 0

  return (
    <Box
      sx={{
        height: `${isMobile ? '30px' : '38px'}`,
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        width: 'fit-content',
      }}
    >
      <Skeleton variant="rectangular" width={`${isMobile ? '140px' : '120px'}`} height={15} />
    </Box>
  )
}
