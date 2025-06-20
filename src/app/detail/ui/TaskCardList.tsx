'use client'

import { updateTask } from '@/app/(home)/actions'
import { UserRole } from '@/app/api/core/types/user'
import { clientUpdateTask, updateAssignee, updateTaskDetail } from '@/app/detail/[task_id]/[user_type]/actions'
import { StyledModal } from '@/app/detail/ui/styledComponent'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { TaskMetaItems } from '@/components/atoms/TaskMetaItems'
import { CopilotPopSelector } from '@/components/inputs/CopilotSelector'
import { DatePickerComponent } from '@/components/inputs/DatePickerComponent'
import { SelectorType } from '@/components/inputs/Selector'
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
import store from '@/redux/store'
import { DateStringSchema } from '@/types/date'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssigneeCombined, InputValue, Sizes } from '@/types/interfaces'
import { getAssigneeId, getAssigneeName, getUserIds, UserIdsType } from '@/utils/assignee'
import { createDateFromFormattedDateString, formatDate } from '@/utils/dateHelper'
import { getCardHref } from '@/utils/getCardHref'
import { isTaskCompleted } from '@/utils/isTaskCompleted'
import { NoAssignee } from '@/utils/noAssignee'
import { getSelectedUserIds } from '@/utils/selector'
import { shouldConfirmBeforeReassignment } from '@/utils/shouldConfirmBeforeReassign'
import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
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
  const { assignee, workflowStates, previewMode, token, confirmAssignModalId, assigneeCache } = useSelector(selectTaskBoard)

  const [currentDueDate, setCurrentDueDate] = useState<string | undefined>(task.dueDate)
  const [selectedAssignee, setSelectedAssignee] = useState<UserIdsType | undefined>(undefined)

  useEffect(() => {
    if (assignee.length > 0) {
      const currentAssignee = assignee.find((el) => el.id === task.assigneeId)
      const finalAssignee = currentAssignee ?? NoAssignee
      // @ts-expect-error  "type" property has mismatching types in between NoAssignee and IAssigneeCombined
      store.dispatch(setAssigneeCache({ key: task.id, value: finalAssignee }))
      setAssigneeValue(finalAssignee)
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

  const statusValue = _statusValue as WorkflowStateResponse

  const handleConfirmAssigneeChange = (userIds: UserIdsType) => {
    const { internalUserId, clientId, companyId } = userIds
    if (handleUpdate) {
      token &&
        handleUpdate(task.id, { internalUserId, clientId, companyId }, () =>
          updateAssignee(token, task.id, internalUserId, clientId, companyId),
        )
    } else {
      token && updateAssignee(token, task.id, internalUserId, clientId, companyId)
    }
    store.dispatch(setConfirmAssigneeModalId(undefined))
  }

  const handleAssigneeChange = (inputValue: InputValue[]) => {
    const newUserIds = getSelectedUserIds(inputValue)
    const previousAssignee = assignee.find((assignee) => assignee.id == getAssigneeId(getUserIds(task)))
    const nextAssignee = assignee.find((assignee) => assignee.id == getAssigneeId(newUserIds))
    const shouldShowConfirmModal = shouldConfirmBeforeReassignment(previousAssignee, nextAssignee)
    if (shouldShowConfirmModal) {
      setSelectedAssignee(newUserIds)
      store.dispatch(setConfirmAssigneeModalId(task.id))
    } else {
      const { internalUserId, clientId, companyId } = newUserIds
      if (handleUpdate) {
        token &&
          handleUpdate(task.id, { assigneeId: nextAssignee?.id }, () =>
            updateAssignee(token, task.id, internalUserId, clientId, companyId),
          )
      } else {
        token && updateAssignee(token, task.id, internalUserId, clientId, companyId)
      }
      setAssigneeValue(assignee.find((assignee) => assignee.id === nextAssignee?.id) ?? NoAssignee)
    }
  }

  const handleUnassignment = useCallback(() => {
    setAssigneeValue(NoAssignee)
    updateAssignee(token!, task.id, null, null, null) // This is a safe non-null asssertion since callback is recomputed as token is loaded
  }, [token, task.id])

  const getAssigneeValue = (userIds?: UserIdsType) => {
    if (!userIds) {
      return NoAssignee
    }
    const assigneeId = getAssigneeId(userIds)
    const match = assignee.find((assignee) => assignee.id === assigneeId)
    return match ?? NoAssignee
  }

  const [assigneeValue, setAssigneeValue] = useState<IAssigneeCombined | Omit<IAssigneeCombined, 'type'> | undefined>(() => {
    return assigneeCache[task.id]
  }) //Omitting type for NoAssignee

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
          <CopilotPopSelector
            name="Set assignee"
            disabled={mode === UserRole.Client && !previewMode}
            initialValue={(() => {
              const value = assigneeValue as IAssigneeCombined
              if (!value || value === NoAssignee) return undefined
              return value
            })()}
            onChange={handleAssigneeChange}
            onEmptySelection={handleUnassignment}
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
              You&apos;re about to reassign this task from{' '}
              <strong>{getAssigneeName(getAssigneeValue(getUserIds(task)))}</strong> to{' '}
              <strong>{getAssigneeName(getAssigneeValue(selectedAssignee))}</strong>. This will give{' '}
              <strong>{getAssigneeName(getAssigneeValue(selectedAssignee))}</strong> access to all task comments and history.
            </>
          }
          title="Reassign task?"
        />
      </StyledModal>
    </Stack>
  )
}
