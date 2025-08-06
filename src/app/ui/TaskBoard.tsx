'use client'

import { updateTask, updateViewModeSettings } from '@/app/(home)/actions'
import { TaskDataFetcher } from '@/app/_fetchers/TaskDataFetcher'
import { clientUpdateTask } from '@/app/detail/[task_id]/[user_type]/actions'
import { TaskCardList } from '@/app/detail/ui/TaskCardList'
import { TaskBoardAppBridge } from '@/app/ui/TaskBoardAppBridge'
import { CustomDragLayer } from '@/components/CustomDragLayer'
import { CardDragLayer } from '@/components/cards/CardDragLayer'
import { TaskCard } from '@/components/cards/TaskCard'
import { TaskColumn } from '@/components/cards/TaskColumn'
import { TaskRow } from '@/components/cards/TaskRow'
import DashboardEmptyState from '@/components/layouts/EmptyState/DashboardEmptyState'
import { NoFilteredTasksState } from '@/components/layouts/EmptyState/NoFilteredTasksState'
import { FilterBar } from '@/components/layouts/FilterBar'
import { Header } from '@/components/layouts/Header'
import { CustomLink } from '@/hoc/CustomLink'
import CustomScrollBar from '@/hoc/CustomScrollBar'
import { DragDropHandler } from '@/hoc/DragDropHandler'
import { useFilter } from '@/hooks/useFilter'
import { selectTaskBoard, updateWorkflowStateIdByTaskId } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { WorkspaceResponse } from '@/types/common'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'
import { View } from '@/types/interfaces'
import { checkEmptyAssignee } from '@/utils/assignee'
import { getCardHref } from '@/utils/getCardHref'
import { sortTaskByDescendingOrder } from '@/utils/sortTask'
import { prioritizeStartedStates } from '@/utils/workflowStates'
import { UserRole } from '@api/core/types/user'
import { Box, Stack } from '@mui/material'
import React, { useMemo, useTransition } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { z } from 'zod'
import { useVirtualizer } from '@tanstack/react-virtual'

interface TaskBoardProps {
  mode: UserRole
  workspace?: WorkspaceResponse
}
export const TaskBoard = ({ mode, workspace }: TaskBoardProps) => {
  const [isPending, startTransition] = useTransition()
  const {
    workflowStates,
    tasks,
    token,
    filteredTasks,
    view,
    viewSettingsTemp,
    filterOptions,
    showArchived,
    showUnarchived,
    isTasksLoading,
    previewMode,
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

  const filteredTasksByState = useMemo(() => {
    const grouped: Record<string, TaskResponse[]> = {}
    for (const state of workflowStates) {
      grouped[state.id] = tasks.filter((task) => task.workflowStateId === state.id)
    }
    return grouped
  }, [tasks, workflowStates])

  const updateViewModeSetting = useCallback(
    (payload: CreateViewSettingsDTO) => {
      startTransition(() => {
        updateViewModeSettings(z.string().parse(token), payload)
      })
    },
    [token],
  )

  const filterTaskWithWorkflowStateId = (workflowStateId: string) => {
    return filteredTasksByState[workflowStateId] ?? []
  }

  const taskCountForWorkflowStateId = (workflowStateId: string): string => {
    const taskCount = tasks.filter((task) => task.workflowStateId === workflowStateId).length
    const filteredTaskCount = tasks.filter((task) => task.workflowStateId === workflowStateId).length
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

  // useFilter(viewSettingsTemp ? viewSettingsTemp.filterOptions : filterOptions)
  const userHasNoFilter =
    filterOptions &&
    !filterOptions.type &&
    !filterOptions.keyword &&
    (checkEmptyAssignee(filterOptions.assignee) || previewMode) &&
    archivedOptions.showUnarchived &&
    !archivedOptions.showArchived

  const isNoTasksWithFilter = !tasks.length && !userHasNoFilter

  const [hasInitialized, setHasInitialized] = useState(false)
  useEffect(() => {
    if (!isTasksLoading && !hasInitialized) {
      setHasInitialized(true)
    }
  }, [isTasksLoading])

  if (!hasInitialized) {
    return <TaskDataFetcher token={token ?? ''} />
  } //fix this logic as soon as copilot API natively supports access scopes by creating an endpoint which shows the count of filteredTask and total tasks.

  if (tasks && tasks.length === 0 && userHasNoFilter && !isTasksLoading) {
    return (
      <>
        <TaskDataFetcher token={token ?? ''} />
        {mode == UserRole.IU && (
          <TaskBoardAppBridge
            token={token ?? ''}
            role={UserRole.IU}
            portalUrl={workspace?.portalUrl}
            isTaskBoardEmpty={true}
          />
        )}

        <DashboardEmptyState userType={mode} />
      </>
    )
  }

  const showHeader = !!previewMode

  return (
    <>
      <TaskDataFetcher token={token ?? ''} />
      {mode == UserRole.IU && <TaskBoardAppBridge token={token ?? ''} role={UserRole.IU} portalUrl={workspace?.portalUrl} />}
      {showHeader && <Header showCreateTaskButton={mode === UserRole.IU || !!previewMode} showMenuBox={!previewMode} />}
      <FilterBar mode={mode} updateViewModeSetting={updateViewModeSetting} />
      {isNoTasksWithFilter && <NoFilteredTasksState />}

      {!!tasks.length && viewBoardSettings === View.BOARD_VIEW && (
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
                droppable
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
                    token={token ?? null}
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
          <CustomScrollBar>
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
                  {sortTaskByDescendingOrder<TaskResponse>(filterTaskWithWorkflowStateId(list.id)).map((task, index) => {
                    return (
                      <DragDropHandler
                        key={task.id}
                        accept={'taskCard'}
                        index={index}
                        task={task}
                        draggable // Make ListViewTaskCard draggable
                      >
                        <TaskCardList task={task} variant="task" key={task.id} workflowState={list} mode={mode} />
                      </DragDropHandler>
                    )
                  })}
                </TaskRow>
              </DragDropHandler>
            ))}
          </CustomScrollBar>
        </Stack>
      )}
      <CustomDragLayer>
        <CardDragLayer />
      </CustomDragLayer>
    </>
  )
}

interface TasksRowVirtualizerProps {
  rows: TaskResponse[]
  mode: UserRole
  token: string | null
}

function TasksRowVirtualizer({ rows, mode, token }: TasksRowVirtualizerProps) {
  const parentRef = React.useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: React.useCallback(
      (index: number) => {
        const task = rows[index]
        let estimate = 70
        if (task.isArchived) estimate += 24
        if (task.dueDate) estimate += 24
        if (task.title && task.title.length > 50) estimate += 20
        return estimate
      },
      [rows],
    ),
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan: 20,
  })

  return (
    <div
      ref={parentRef}
      className="List"
      style={{
        height: `100vh`,
        width: '100%',
        overflow: 'auto',
        columnGap: '6px',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={(node) => rowVirtualizer.measureElement(node)}
            style={{
              display: 'flex',
              position: 'absolute',
              transform: `translateY(${virtualRow.start}px)`,
              width: '100%',
            }}
          >
            <div style={{ padding: '3px 0' }}>
              <CustomLink
                key={rows[virtualRow.index].id}
                href={{
                  pathname: getCardHref(rows[virtualRow.index], mode),
                  query: { token },
                }}
                style={{ width: 'fit-content' }}
              >
                <DragDropHandler
                  key={rows[virtualRow.index].id}
                  accept={'taskCard'}
                  index={virtualRow.index}
                  task={rows[virtualRow.index]}
                  draggable
                >
                  <Box>
                    <TaskCard
                      task={rows[virtualRow.index]}
                      key={rows[virtualRow.index].id}
                      href={{
                        pathname: getCardHref(rows[virtualRow.index], mode),
                        query: { token },
                      }}
                    />
                  </Box>
                </DragDropHandler>
              </CustomLink>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
