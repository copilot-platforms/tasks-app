'use client'

import { updateTask } from '@/app/(home)/actions'
import { UserRole } from '@/app/api/core/types/user'
import { clientUpdateTask, updateAssignee, updateTaskDetail } from '@/app/detail/[task_id]/[user_type]/actions'
import { StyledModal } from '@/app/detail/ui/styledComponent'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { MiniLoader } from '@/components/atoms/MiniLoader'
import { TaskMetaItems } from '@/components/atoms/TaskMetaItems'
import { DatePickerComponent } from '@/components/inputs/DatePickerComponent'
import Selector, { SelectorType } from '@/components/inputs/Selector'
import { WorkflowStateSelector } from '@/components/inputs/Selector-WorkflowState'
import { ConfirmUI } from '@/components/layouts/ConfirmUI'
import { CustomLink } from '@/hoc/CustomLink'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import {
  selectTaskBoard,
  setAssigneeCache,
  setConfirmAssigneeModalId,
  updateWorkflowStateIdByTaskId,
} from '@/redux/features/taskBoardSlice'
import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'
import { DateStringSchema } from '@/types/date'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssigneeCombined, IUserIds, Sizes } from '@/types/interfaces'
import { getAssigneeName, isAssigneeTextMatching } from '@/utils/assignee'
import { createDateFromFormattedDateString, formatDate } from '@/utils/dateHelper'
import { getAssigneeTypeCorrected } from '@/utils/getAssigneeTypeCorrected'
import { getCardHref } from '@/utils/getCardHref'
import { isTaskCompleted } from '@/utils/isTaskCompleted'
import { NoAssignee, NoAssigneeExtraOptions, NoDataFoundOption } from '@/utils/noAssignee'
import { ShouldConfirmBeforeReassignment } from '@/utils/shouldConfirmBeforeReassign'
import { setDebouncedFilteredAssignees } from '@/utils/users'
import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { AssigneeType } from '@prisma/client'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ScopedMutator } from 'swr/_internal'
import { z } from 'zod'

interface TaskCardListProps {
  task: TaskResponse
  variant: 'task' | 'subtask' //task variant is used in task board list view, subtask variant is used for sub task list in details page
  workflowState?: WorkflowStateResponse
  mode: UserRole
  assignee?: IAssigneeCombined
  handleUpdate?: (taskId: string, changes: Partial<TaskResponse>, updater: () => Promise<void>) => Promise<void>
}

export const TaskCardList = ({ task, variant, workflowState, mode, handleUpdate }: TaskCardListProps) => {
  const { assignee, workflowStates, previewMode, token, confirmAssignModalId, assigneeCache, activeTask } =
    useSelector(selectTaskBoard)
  const { activeTaskAssignees } = useSelector(selectTaskDetails)

  const [currentAssignee, setCurrentAssignee] = useState<IAssigneeCombined | undefined>(() => {
    return assigneeCache[task.id]
  })
  const [currentDueDate, setCurrentDueDate] = useState<string | undefined>(task.dueDate)
  const [inputStatusValue, setInputStatusValue] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState<IAssigneeCombined | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [filteredAssignees, setFilteredAssignees] = useState(activeTaskAssignees.length ? activeTaskAssignees : assignee)
  const [activeDebounceTimeoutId, setActiveDebounceTimeoutId] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (assignee.length > 0) {
      const currentAssignee = assignee.find((el) => el.id === task.assigneeId)
      const finalAssignee = currentAssignee ?? NoAssignee
      // @ts-expect-error  "type" property has mismatching types in between NoAssignee and IAssigneeCombined
      store.dispatch(setAssigneeCache({ key: task.id, value: finalAssignee }))
      //@ts-expect-error  "type" property has mismatching types in between NoAssignee and IAssigneeCombined
      setCurrentAssignee(finalAssignee)
    }
  }, [assignee, task.id, task.assigneeId])

  useEffect(() => {
    setCurrentDueDate(task.dueDate)
  }, [task.dueDate])

  const { renderingItem: _statusValue, updateRenderingItem: updateStatusValue } = useHandleSelectorComponent({
    // item: selectedWorkflowState,
    item: workflowState ?? task.workflowState,
    type: SelectorType.STATUS_SELECTOR,
  })
  const { renderingItem: _assigneeValue, updateRenderingItem: updateAssigneeValue } = useHandleSelectorComponent({
    // item: selectedAssigneeId ? assignee.find((el) => el.id === selectedAssigneeId) : NoAssignee,
    item: currentAssignee,
    type: SelectorType.ASSIGNEE_SELECTOR,
  })

  const statusValue = _statusValue as WorkflowStateResponse
  const assigneeValue = _assigneeValue as IAssigneeCombined

  const getUserIdsFromAssignee = (assigneeValue: IAssigneeCombined): IUserIds => {
    const type = getAssigneeTypeCorrected(assigneeValue)
    switch (type) {
      case AssigneeType.internalUser:
        return { internalUserId: assigneeValue.id, clientId: null, companyId: null }
      case AssigneeType.client:
        return { internalUserId: null, clientId: assigneeValue.id, companyId: assigneeValue.companyId || null }
      case AssigneeType.company:
        return { internalUserId: null, clientId: null, companyId: assigneeValue.id }
      default:
        return { internalUserId: null, clientId: null, companyId: null }
    }
  } //remove this util while implementing CopilotSelector for task lists assignee update. This is a simple patch to fix build issues.

  const handleConfirmAssigneeChange = (assigneeValue: IAssigneeCombined) => {
    const { internalUserId, clientId, companyId } = getUserIdsFromAssignee(assigneeValue)

    if (handleUpdate) {
      token &&
        handleUpdate(task.id, { assigneeId: assigneeValue.id }, () =>
          updateAssignee(token, task.id, internalUserId, clientId, companyId),
        )
    } else {
      token && updateAssignee(token, task.id, internalUserId, clientId, companyId)
    }
    store.dispatch(setConfirmAssigneeModalId(undefined))
  }

  const getClientCompanyId = () => {
    if (variant == 'subtask' && activeTask) {
      return activeTask.assigneeType !== AssigneeType.internalUser ? activeTask.assigneeId : undefined
    }
    return undefined
  }

  return (
    <Stack
      direction="row"
      sx={{
        height: variant == 'task' ? '44px' : '36px',
        display: 'flex',
        padding: variant == 'task' ? '6px 20px 6px 20px' : '6px 0px 6px 0px',
        alignItems: 'center',
        alignSelf: 'stretch',
        gap: '20px',
        justifyContent: 'flex-end',
        minWidth: 0,
        ':hover': {
          cursor: 'pointer',
          background: (theme) => theme.color.gray[100],
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          display: 'flex',
          gap: '2px',
          minWidth: 0,
          flexGrow: 1,
          flexShrink: 1,
        }}
      >
        <WorkflowStateSelector
          option={workflowStates}
          value={statusValue}
          variant="icon"
          getValue={(value) => {
            updateStatusValue(value)
            if (variant === 'task') {
              store.dispatch(updateWorkflowStateIdByTaskId({ taskId: task.id, targetWorkflowStateId: value.id }))
            }
            if (mode === UserRole.Client && !previewMode) {
              clientUpdateTask(z.string().parse(token), task.id, value.id)
            } else {
              updateTask({
                token: z.string().parse(token),
                taskId: task.id,
                payload: { workflowStateId: value.id },
              })
            }
          }}
          responsiveNoHide
          size={Sizes.MEDIUM}
          padding={'2px 4px'}
        />
        <CustomLink
          key={task.id}
          href={{ pathname: getCardHref(task, mode), query: { token } }}
          style={{
            display: 'flex',
            gap: '2px',
            minWidth: 0,
            flexGrow: 0,
            flexShrink: 1,
            width: '100%',
          }}
        >
          <Stack
            direction="row"
            sx={{
              gap: '8px',
              display: 'flex',
              alignItems: 'center',
              marginRight: 'auto',
              minWidth: 0,
              flexGrow: 1,
              flexShrink: 1,
            }}
          >
            <Typography
              variant="bodySm"
              sx={{
                lineHeight: variant == 'task' ? '22px' : '21px',
                fontSize: variant == 'task' ? '14px' : '13px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flexShrink: 1,
                flexGrow: 0,
                minWidth: 0,
              }}
            >
              {task.title}
            </Typography>
            {(task.subtaskCount > 0 || task.isArchived) && (
              <Stack direction="row" sx={{ display: 'flex', gap: '12px', flexShrink: 0, alignItems: 'center' }}>
                <TaskMetaItems task={task} lineHeight="21px" />
              </Stack>
            )}
          </Stack>
        </CustomLink>
      </Stack>

      <Stack
        direction="row"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: 'auto',
          justifyContent: 'flex-end',
        }}
      >
        {task.dueDate && (
          <Box sx={{ minWidth: '105px', display: 'flex', justifyContent: 'flex-end' }}>
            <DatePickerComponent
              getDate={(date) => {
                const isoDate = DateStringSchema.parse(formatDate(date))
                if (handleUpdate) {
                  token &&
                    handleUpdate(task.id, { dueDate: isoDate }, () =>
                      updateTaskDetail({ token, taskId: task.id, payload: { dueDate: isoDate } }),
                    )
                } else {
                  token && updateTaskDetail({ token, taskId: task.id, payload: { dueDate: isoDate } })
                }
                setCurrentDueDate(isoDate)
              }}
              variant="icon"
              padding="2px 4px"
              dateValue={currentDueDate ? createDateFromFormattedDateString(z.string().parse(currentDueDate)) : undefined}
              disabled={mode === UserRole.Client && !previewMode}
              isDone={isTaskCompleted(task, workflowStates)}
            />
          </Box>
        )}
        {assigneeValue ? (
          <Selector
            inputStatusValue={inputStatusValue}
            variant="icon"
            placeholder="Set assignee"
            setInputStatusValue={setInputStatusValue}
            buttonWidth="100%"
            getSelectedValue={(newValue) => {
              const assignee = newValue as IAssigneeCombined
              const shouldShowConfirmModal = ShouldConfirmBeforeReassignment(assigneeValue, assignee)
              if (shouldShowConfirmModal) {
                setSelectedAssignee(assignee)
                store.dispatch(setConfirmAssigneeModalId(task.id))
              } else {
                const { internalUserId, clientId, companyId } = getUserIdsFromAssignee(assigneeValue)

                if (handleUpdate) {
                  token &&
                    handleUpdate(task.id, { assigneeId: assignee.id }, () =>
                      updateAssignee(token, task.id, internalUserId, clientId, companyId),
                    )
                } else {
                  token && updateAssignee(token, task.id, internalUserId, clientId, companyId)
                }

                updateAssigneeValue(assignee)
              }
            }}
            options={loading ? [] : filteredAssignees.length ? filteredAssignees : [NoDataFoundOption]}
            value={assigneeValue?.name == 'No assignee' ? null : assigneeValue}
            selectorType={SelectorType.ASSIGNEE_SELECTOR}
            buttonHeight="auto"
            buttonContent={
              <Box
                sx={{
                  padding: '2px 2px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                  ...(!(mode === UserRole.Client && !previewMode) && {
                    ':hover': {
                      cursor: 'pointer',
                      background: (theme) => theme.color.gray[150],
                    },
                  }),
                }}
              >
                <CopilotAvatar currentAssignee={assigneeValue as IAssigneeCombined} />
              </Box>
            }
            handleInputChange={async (newInputValue: string) => {
              if (!newInputValue || isAssigneeTextMatching(newInputValue, assigneeValue)) {
                setFilteredAssignees(activeTaskAssignees.length ? activeTaskAssignees : assignee)
                return
              }

              setDebouncedFilteredAssignees(
                activeDebounceTimeoutId,
                setActiveDebounceTimeoutId,
                setLoading,
                setFilteredAssignees,
                z.string().parse(token),
                newInputValue,
                undefined,
                getClientCompanyId(),
              )
            }}
            extraOption={NoAssigneeExtraOptions}
            extraOptionRenderer={(setAnchorEl, anchorEl, props) => {
              return <>{loading && <MiniLoader />}</>
            }}
            disabled={mode === UserRole.Client && !previewMode}
            cursor="pointer"
            filterOption={(x: unknown) => x}
            responsiveNoHide
            currentOption={assigneeValue}
          />
        ) : (
          <Box
            sx={{
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
              ...(!(mode === UserRole.Client && !previewMode) && {
                ':hover': {
                  cursor: 'pointer',
                  background: (theme) => theme.color.gray[150],
                },
              }),
            }}
          >
            <Skeleton variant="circular" width={20} height={20} />
          </Box>
        )}
      </Stack>
      <StyledModal
        open={confirmAssignModalId === task.id}
        onClose={() => store.dispatch(setConfirmAssigneeModalId(undefined))}
        aria-labelledby="confirm-reassignment-modal"
        aria-describedby="confirm-reassignment"
      >
        <ConfirmUI
          handleCancel={() => {
            setSelectedAssignee(undefined)
            store.dispatch(setConfirmAssigneeModalId(undefined))
          }}
          handleConfirm={() => {
            if (selectedAssignee) {
              handleConfirmAssigneeChange(selectedAssignee)
            }
          }}
          buttonText="Reassign"
          description={
            <>
              You&apos;re about to reassign this task from <strong>{getAssigneeName(assigneeValue)}</strong> to{' '}
              <strong>{getAssigneeName(selectedAssignee)}</strong>. This will give{' '}
              <strong>{getAssigneeName(selectedAssignee)}</strong> access to all task comments and history.
            </>
          }
          title="Reassign task?"
        />
      </StyledModal>
    </Stack>
  )
}
