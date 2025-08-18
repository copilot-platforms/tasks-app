'use client'

import { UserRole } from '@/app/api/core/types/user'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { SelectorType } from '@/components/inputs/Selector'
import { WorkflowStateSelector } from '@/components/inputs/Selector-WorkflowState'
import { useHandleSelectorComponent } from '@/hooks/useHandleSelectorComponent'
import { useSubtaskCount } from '@/hooks/useSubtaskCount'
import {
  selectTaskBoard,
  setAssigneeCache,
  setConfirmAssigneeModalId,
  updateWorkflowStateIdByTaskId,
} from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssigneeCombined, InputValue, Sizes } from '@/types/interfaces'
import { getAssigneeId, getUserIds, UserIdsType } from '@/utils/assignee'
import { isTaskCompleted } from '@/utils/isTaskCompleted'
import { NoAssignee } from '@/utils/noAssignee'
import { Box, Skeleton, Stack, styled, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { UrlObject } from 'url'

import { updateTask } from '@/app/(home)/actions'
import { clientUpdateTask, updateAssignee, updateTaskDetail } from '@/app/detail/[task_id]/[user_type]/actions'
import { CopilotTooltip } from '@/components/atoms/CopilotTooltip'
import { TaskMetaItems } from '@/components/atoms/TaskMetaItems'
import { CopilotPopSelector } from '@/components/inputs/CopilotSelector'
import { DatePickerComponent } from '@/components/inputs/DatePickerComponent'
import { DateStringSchema } from '@/types/date'
import { createDateFromFormattedDateString, formatDate } from '@/utils/dateHelper'
import { getSelectedUserIds, getSelectorAssignee, getSelectorAssigneeFromTask } from '@/utils/selector'
import { shouldConfirmBeforeReassignment } from '@/utils/shouldConfirmBeforeReassign'
import z from 'zod'
import { TaskCardList } from '@/app/detail/ui/TaskCardList'
import { CustomLink } from '@/hoc/CustomLink'
import { getCardHref } from '@/utils/getCardHref'
import { sortTaskByDescendingOrder } from '@/utils/sortTask'

const TaskCardContainer = styled(Stack)(({ theme }) => ({
  border: `1px solid ${theme.color.borders.border}`,
  borderRadius: theme.spacing(theme.shape.radius100),
  background: theme.color.base.white,
  padding: '12px',
  overflowWrap: 'break-word',
  userSelect: 'none',
  ':hover': {
    background: theme.color.gray[100],
  },
  ':focus-visible': {
    borderColor: theme.color.borders.focusBorder2,
    borderRadius: theme.spacing(theme.shape.radius100),
    outline: 'none',
  },
  cursor: 'pointer',
  width: '304px',
}))

interface TaskCardProps {
  task: TaskResponse
  href: string | UrlObject
  mode: UserRole
  workflowState?: WorkflowStateResponse
  subtasks?: TaskResponse[]
}

export const TaskCard = ({ task, href, workflowState, mode, subtasks }: TaskCardProps) => {
  const { assignee, workflowStates, assigneeCache, previewMode, token, accessibleTasks, showSubtasks } =
    useSelector(selectTaskBoard)

  const subtaskCount = useSubtaskCount(task.id)

  const [currentDueDate, setCurrentDueDate] = useState<string | undefined>(task.dueDate)

  const [selectedAssignee, setSelectedAssignee] = useState<UserIdsType | undefined>(undefined)

  const { renderingItem: _statusValue, updateRenderingItem: updateStatusValue } = useHandleSelectorComponent({
    // item: selectedWorkflowState,
    item: workflowState ?? task.workflowState,
    type: SelectorType.STATUS_SELECTOR,
  })

  const statusValue = _statusValue as WorkflowStateResponse

  useEffect(() => {
    if (assignee.length > 0) {
      const currentAssignee = getSelectorAssigneeFromTask(assignee, task)
      const finalAssignee = currentAssignee ?? NoAssignee
      store.dispatch(setAssigneeCache({ key: task.id, value: finalAssignee }))
      setAssigneeValue(finalAssignee)
    }
  }, [assignee, task.id, task.assigneeId])

  const handleConfirmAssigneeChange = (userIds: UserIdsType) => {
    const { internalUserId, clientId, companyId } = userIds

    token && updateAssignee(token, task.id, internalUserId, clientId, companyId)

    store.dispatch(setConfirmAssigneeModalId(undefined))
  }

  const handleAssigneeChange = (inputValue: InputValue[]) => {
    const newUserIds = getSelectedUserIds(inputValue)
    const previousAssignee = assignee.find((assignee) => assignee.id == getAssigneeId(getUserIds(task)))
    const nextAssignee = getSelectorAssignee(assignee, inputValue)
    const shouldShowConfirmModal = shouldConfirmBeforeReassignment(previousAssignee, nextAssignee)
    if (shouldShowConfirmModal) {
      setSelectedAssignee(newUserIds)
      store.dispatch(setConfirmAssigneeModalId(task.id))
    } else {
      const { internalUserId, clientId, companyId } = newUserIds

      token && updateAssignee(token, task.id, internalUserId, clientId, companyId)

      setAssigneeValue(nextAssignee ?? NoAssignee)
    }
  }
  const [assigneeValue, setAssigneeValue] = useState<IAssigneeCombined | Omit<IAssigneeCombined, 'type'> | undefined>(() => {
    return assigneeCache[task.id]
  }) //Omitting type for NoAssignee

  return (
    <TaskCardContainer tabIndex={0}>
      <Stack direction="column" rowGap={'12px'}>
        <Stack direction={'row'} columnGap={'2px'}>
          <Box sx={{ alignItems: 'top' }}>
            <WorkflowStateSelector
              option={workflowStates}
              value={statusValue}
              variant="icon"
              getValue={(value) => {
                updateStatusValue(value)
                store.dispatch(updateWorkflowStateIdByTaskId({ taskId: task.id, targetWorkflowStateId: value.id }))
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
              padding={'4px'}
            />
          </Box>
          <Stack direction="column" justifyContent="center" rowGap={'5px'} sx={{ width: '100%' }}>
            <Stack direction={'row'} columnGap={'10px'} justifyContent={'space-between'}>
              <Typography
                variant="bodyMd"
                sx={{
                  color: (theme) => theme.color.gray[600],
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {task.title}
              </Typography>

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
                  tooltipProps={{
                    content: assigneeValue === NoAssignee ? 'Set assignee' : 'Change assignee',
                    disabled: mode === UserRole.Client && !previewMode,
                  }}
                  variant="icon"
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
            <Stack direction={'row'} columnGap={'10px'} justifyContent={'space-between'}>
              <Box sx={{ ml: '-4px' }}>
                {task.dueDate && (
                  <DatePickerComponent
                    getDate={(date) => {
                      const isoDate = DateStringSchema.parse(formatDate(date))
                      token && updateTaskDetail({ token, taskId: task.id, payload: { dueDate: isoDate } })
                      setCurrentDueDate(isoDate)
                    }}
                    variant="icon"
                    padding="0px 4px"
                    dateValue={
                      currentDueDate ? createDateFromFormattedDateString(z.string().parse(currentDueDate)) : undefined
                    }
                    disabled={mode === UserRole.Client && !previewMode}
                    isDone={isTaskCompleted(task, workflowStates)}
                    isShort
                    tooltipProps={{
                      disabled: mode === UserRole.Client && !previewMode,
                    }}
                  />
                )}
              </Box>

              {(task.isArchived || subtaskCount > 0) && (
                <Stack
                  direction="row"
                  sx={{
                    display: 'flex',
                    gap: '12px',
                    flexShrink: 0,
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '0px 5px',
                  }}
                >
                  <TaskMetaItems task={task} lineHeight="18px" />
                </Stack>
              )}
            </Stack>
          </Stack>
        </Stack>
        {showSubtasks && subtasks && subtasks.length > 0 && (
          <Stack direction="column">
            {subtasks.map((subtask) => {
              return (
                <CustomLink key={subtask.id} href={{ pathname: getCardHref(subtask, mode), query: { token } }}>
                  <Box
                    sx={{
                      marginLeft: '-12px',
                      marginRight: '-12px',
                      paddingLeft: '32px',
                      paddingRight: '12px',
                      ':hover': {
                        background: (theme) => theme.color.gray[150],
                      },
                    }}
                  >
                    <TaskCardList task={subtask} variant="subtask-board" mode={mode} />
                  </Box>
                </CustomLink>
              )
            })}
          </Stack>
        )}
      </Stack>
    </TaskCardContainer>
  )
}
