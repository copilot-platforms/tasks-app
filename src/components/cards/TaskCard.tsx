'use client'

import { UserRole } from '@/app/api/core/types/user'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { SelectorType } from '@/components/inputs/Selector'
import { DueDateLayout } from '@/components/layouts/DueDateLayout'
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
import { WorkflowStateSelector } from '../inputs/Selector-WorkflowState'

import { updateTask } from '@/app/(home)/actions'
import { clientUpdateTask, updateAssignee } from '@/app/detail/[task_id]/[user_type]/actions'
import { getSelectedUserIds, getSelectorAssignee, getSelectorAssigneeFromTask } from '@/utils/selector'
import { shouldConfirmBeforeReassignment } from '@/utils/shouldConfirmBeforeReassign'
import z from 'zod'
import { CopilotPopSelector } from '../inputs/CopilotSelector'

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
  cursor: 'pointer',
  width: '304px',
}))

interface TaskCardProps {
  task: TaskResponse
  href: string | UrlObject
  mode: UserRole
  workflowState?: WorkflowStateResponse
}

export const TaskCard = ({ task, href, workflowState, mode }: TaskCardProps) => {
  const { assignee, workflowStates, assigneeCache, previewMode, token } = useSelector(selectTaskBoard)

  const subtaskCount = useSubtaskCount(task.id)

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
    <TaskCardContainer>
      {/* <Stack rowGap={1}>
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="column" rowGap={'4px'}>
            {(task.isArchived || subtaskCount > 0) && (
              <Stack direction="row" sx={{ display: 'flex', gap: '12px', flexShrink: 0, alignItems: 'center' }}>
                <TaskMetaItems task={task} lineHeight="18px" />
              </Stack>
            )}

            {currentAssignee ? (
              <Stack direction="row" alignItems="center" columnGap={1}>
                <CopilotAvatar currentAssignee={currentAssignee as IAssigneeCombined} />
                <Typography
                  variant="sm"
                  fontSize="12px"
                  sx={{
                    color: (theme) => theme.color.gray[500],
                    width: '146px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {getAssigneeName(currentAssignee)}
                </Typography>
              </Stack>
            ) : (
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" columnGap={'4px'}>
                  <Skeleton variant="circular" width={20} height={20} />
                  <Skeleton variant="rectangular" width="146px" height="12px" />
                </Stack>
              </Box>
            )}
          </Stack>

          <Typography variant="bodyXs" fontWeight={400} sx={{ color: (theme) => theme.color.gray[500] }}>
            {task.label}
          </Typography>
        </Stack>
        <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[600] }}>
          {task.title}
        </Typography>
        {task.dueDate && <DueDateLayout dateString={task.dueDate} isDone={isTaskCompleted(task, workflowStates)} />}
      </Stack> */}

      <Stack direction={'row'} columnGap={'10px'} justifyContent={'space-between'}>
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
          <Stack direction="column" justifyContent="center" rowGap={'5px'}>
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
            {task.dueDate && (
              <DueDateLayout dateString={task.dueDate} isDone={isTaskCompleted(task, workflowStates)} variant="board" />
            )}
          </Stack>
        </Stack>
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
    </TaskCardContainer>
  )
}
