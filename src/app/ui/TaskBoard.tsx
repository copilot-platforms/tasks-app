'use client'

import { updateTask, updateViewModeSettings } from '@/app/(home)/actions'
import { TaskDataFetcher } from '@/app/_fetchers/TaskDataFetcher'
import { clientUpdateTask } from '@/app/detail/[task_id]/[user_type]/actions'
import { TaskBoardAppBridge } from '@/app/ui/TaskBoardAppBridge'
import { CustomDragLayer } from '@/components/CustomDragLayer'
import { CardDragLayer } from '@/components/cards/CardDragLayer'
import { TaskColumn } from '@/components/cards/TaskColumn'
import { TaskRow } from '@/components/cards/TaskRow'
import DashboardEmptyState from '@/components/layouts/EmptyState/DashboardEmptyState'
import { NoFilteredTasksState } from '@/components/layouts/EmptyState/NoFilteredTasksState'
import { FilterBar } from '@/components/layouts/FilterBar'
import { Header } from '@/components/layouts/Header'
import { DragDropHandler } from '@/hoc/DragDropHandler'
import { useFilter } from '@/hooks/useFilter'
import { selectTaskBoard, updateWorkflowStateIdByTaskId } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { WorkspaceResponse } from '@/types/common'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'
import { View } from '@/types/interfaces'
import { checkEmptyAssignee } from '@/utils/assignee'
import { sortTaskByDescendingOrder } from '@/utils/sortTask'
import { prioritizeStartedStates } from '@/utils/workflowStates'
import { UserRole } from '@api/core/types/user'
import { Box, Stack } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { z } from 'zod'
import { TasksColumnVirtualizer, TasksRowVirtualizer } from '@/app/ui/VirtualizedTasksLists'

interface TaskBoardProps {
  mode: UserRole
  workspace?: WorkspaceResponse
  token: string
}
export const TaskBoard = ({ mode, workspace, token }: TaskBoardProps) => {
  const {
    workflowStates,
    tasks,

    filteredTasks,
    view,
    viewSettingsTemp,
    filterOptions,
    showArchived,
    showUnarchived,
    isTasksLoading,
    previewMode,
    accessibleTasks,
    showSubtasks,
  } = useSelector(selectTaskBoard)

  const onDropItem = useCallback(
    (payload: { taskId: string; targetWorkflowStateId: string }) => {
      const { taskId, targetWorkflowStateId } = payload
      store.dispatch(updateWorkflowStateIdByTaskId({ taskId, targetWorkflowStateId }))
      if (mode === UserRole.Client && !previewMode) {
        clientUpdateTask(z.string().parse(token), taskId, targetWorkflowStateId)
      } else {
        updateTask({
          token: z.string().parse(token),
          taskId,
          payload: { workflowStateId: targetWorkflowStateId },
        })
      }
    },
    [token],
  )
  const filterTaskWithWorkflowStateId = (workflowStateId: string): TaskResponse[] => {
    return filteredTasks.filter((task) => task.workflowStateId === workflowStateId)
  }

  const taskCountForWorkflowStateId = (workflowStateId: string): string => {
    const taskCount = tasks.filter((task) => task.workflowStateId === workflowStateId).length
    const filteredTaskCount = filteredTasks.filter((task) => task.workflowStateId === workflowStateId).length
    const isFilterOn = Object.values(filterOptions).some((value) => !!value)
    if (!isFilterOn) {
      return taskCount.toString()
    }
    return filteredTaskCount.toString()
  }

  const viewBoardSettings = viewSettingsTemp ? viewSettingsTemp.viewMode : view
  const archivedOptions = {
    showArchived: viewSettingsTemp ? viewSettingsTemp.showArchived : showArchived,
    showUnarchived: viewSettingsTemp ? viewSettingsTemp.showUnarchived : showUnarchived,
  }

  useFilter(viewSettingsTemp ? viewSettingsTemp.filterOptions : filterOptions)
  const userHasNoFilter =
    filterOptions &&
    !filterOptions.type &&
    !filterOptions.keyword &&
    (checkEmptyAssignee(filterOptions.assignee) || previewMode) &&
    archivedOptions.showUnarchived &&
    !archivedOptions.showArchived

  const isNoTasksWithFilter = (!tasks.length || !userHasNoFilter) && !filteredTasks.length

  const [hasInitialized, setHasInitialized] = useState(false)
  useEffect(() => {
    if (!isTasksLoading && !hasInitialized) {
      setHasInitialized(true)
    }
  }, [isTasksLoading])

  const subtasksByTaskId = useMemo(() => {
    if (!showSubtasks) return {}
    const grouped: Record<string, TaskResponse[]> = {}

    accessibleTasks.forEach((item) => {
      if (!item.parentId) return
      if (!grouped[item.parentId]) grouped[item.parentId] = []
      grouped[item.parentId].push(item)
    })

    Object.keys(grouped).forEach((id) => {
      grouped[id] = sortTaskByDescendingOrder<TaskResponse>(grouped[id])
    })

    return grouped
  }, [accessibleTasks, showSubtasks])

  if (!hasInitialized) {
    return <TaskDataFetcher token={token} />
  } //fix this logic as soon as copilot API natively supports access scopes by creating an endpoint which shows the count of filteredTask and total tasks.

  if (tasks && tasks.length === 0 && userHasNoFilter && !isTasksLoading) {
    return (
      <>
        <TaskDataFetcher token={token} />
        {mode == UserRole.IU && (
          <TaskBoardAppBridge token={token} role={UserRole.IU} portalUrl={workspace?.portalUrl} isTaskBoardEmpty={true} />
        )}

        <DashboardEmptyState userType={mode} />
      </>
    )
  }

  const showHeader = !!previewMode

  return (
    <>
      <TaskDataFetcher token={token} />
      {mode == UserRole.IU && <TaskBoardAppBridge token={token} role={UserRole.IU} portalUrl={workspace?.portalUrl} />}
      {showHeader && <Header showCreateTaskButton={mode === UserRole.IU || !!previewMode} showMenuBox={!previewMode} />}
      <FilterBar
        mode={mode}
        updateViewModeSetting={async (payload: CreateViewSettingsDTO) => {
          await updateViewModeSettings(z.string().parse(token), payload)
        }}
      />
      {isNoTasksWithFilter && <NoFilteredTasksState />}

      {!!filteredTasks.length && !!tasks.length && viewBoardSettings === View.BOARD_VIEW && (
        <Box sx={{ padding: '12px 12px' }}>
          <Stack
            columnGap={2}
            sx={{
              flexDirection: 'row',
              overflowX: 'auto',
            }}
          >
            {workflowStates.map((list, index) => (
              <DragDropHandler
                key={list.id}
                accept={'taskCard'}
                index={index}
                id={list.id}
                onDropItem={onDropItem}
                droppable // Make TaskColumn droppable
                padding={'8px 12px'}
              >
                <TaskColumn
                  key={list.id}
                  mode={mode}
                  workflowStateId={list.id}
                  columnName={list.name}
                  taskCount={taskCountForWorkflowStateId(list.id)}
                  showAddBtn={mode === UserRole.IU || !!previewMode}
                  showHeader={showHeader}
                >
                  <TasksRowVirtualizer
                    rows={sortTaskByDescendingOrder<TaskResponse>(filterTaskWithWorkflowStateId(list.id))}
                    mode={mode}
                    token={token}
                  />
                </TaskColumn>
              </DragDropHandler>
            ))}
          </Stack>
        </Box>
      )}
      {!!filteredTasks.length && !!tasks.length && viewBoardSettings === View.LIST_VIEW && (
        <Stack
          sx={{
            flexDirection: 'column',
            height: `calc(100vh - ${showHeader ? '135px' : '75px'})`,
            width: '99.92%',
            margin: '0 auto',
          }}
        >
          {prioritizeStartedStates(workflowStates).map((list, index) => (
            <DragDropHandler
              key={list.id}
              accept={'taskCard'}
              index={index}
              id={list.id}
              onDropItem={onDropItem}
              droppable // Make TaskRow droppable
            >
              <TaskRow
                mode={mode}
                workflowStateId={list.id}
                key={list.id}
                columnName={list.name}
                taskCount={taskCountForWorkflowStateId(list.id)}
                display={!!filterTaskWithWorkflowStateId(list.id).length}
                showAddBtn={mode === UserRole.IU || !!previewMode}
              >
                <TasksColumnVirtualizer
                  rows={sortTaskByDescendingOrder<TaskResponse>(filterTaskWithWorkflowStateId(list.id))}
                  list={list}
                  mode={mode}
                  token={token}
                />
              </TaskRow>
            </DragDropHandler>
          ))}
        </Stack>
      )}
      <CustomDragLayer>
        <CardDragLayer mode={mode} />
      </CustomDragLayer>
    </>
  )
}
