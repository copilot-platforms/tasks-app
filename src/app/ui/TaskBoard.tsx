'use client'

import { useCallback, useEffect, useState } from 'react'
import { Box, Stack } from '@mui/material'
import { TaskCard } from '@/components/cards/TaskCard'
import { TaskColumn } from '@/components/cards/TaskColumn'
import { DragDropHandler } from '@/hoc/DragDropHandler'
import { useSelector } from 'react-redux'
import store from '@/redux/store'
import { selectTaskBoard, updateWorkflowStateIdByTaskId } from '@/redux/features/taskBoardSlice'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { ListViewTaskCard } from '@/components/cards/ListViewTaskCard'
import { TaskRow } from '@/components/cards/TaskRow'
import { UserType, View } from '@/types/interfaces'
import { updateTask, updateViewModeSettings } from '@/app/actions'
import { z } from 'zod'
import { CustomScrollbar } from '@/hoc/CustomScrollbar'
import DashboardEmptyState from '@/components/layouts/EmptyState/DashboardEmptyState'
import { Header } from '@/components/layouts/Header'
import { FilterBar } from '@/components/layouts/FilterBar'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'
import { CustomLink } from '@/hoc/CustomLink'
import { sortTaskByDescendingOrder } from '@/utils/sortTask'
import { CustomDragLayer } from '@/components/CustomDragLayer'
import { CardDragLayer } from '@/components/cards/CardDragLayer'
import { UserRole } from '@api/core/types/user'
import { clientUpdateTask } from '@/app/detail/[task_id]/[user_type]/actions'
import { TaskDataFetcher } from '@/app/_fetchers/TaskDataFetcher'
import { NoFilteredTasksState } from '@/components/layouts/EmptyState/NoFilteredTasksState'
import { useFilter } from '@/hooks/useFilter'
import { TaskBoardAppBridge } from '@/app/ui/TaskBoardAppBridge'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'

interface TaskBoardProps {
  mode: UserRole
}
export const TaskBoard = ({ mode }: TaskBoardProps) => {
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
  const { workspace } = useSelector(selectAuthDetails)
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

  const getCardHref = (task: { id: string }) => `/detail/${task.id}/${mode === UserRole.IU ? 'iu' : 'cu'}`
  useFilter(viewSettingsTemp ? viewSettingsTemp.filterOptions : filterOptions)
  const userHasNoFilter =
    filterOptions &&
    !filterOptions.type &&
    !filterOptions.keyword &&
    (!filterOptions.assignee || previewMode) &&
    archivedOptions.showUnarchived &&
    !archivedOptions.showArchived

  const isNoTasksWithFilter = (!tasks.length || !userHasNoFilter) && !filteredTasks.length

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
        {mode === UserRole.IU && <TaskBoardAppBridge token={token ?? ''} role={UserRole.IU} isTaskBoardEmpty={true} />}
        <DashboardEmptyState userType={mode} />
      </>
    )
  }

  const showHeader = !!previewMode

  return (
    <>
      {mode === UserRole.IU && <TaskBoardAppBridge token={token ?? ''} role={UserRole.IU} />}

      <TaskDataFetcher token={token ?? ''} />
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
                  <CustomScrollbar style={{ padding: '4px' }}>
                    <Stack direction="column" rowGap="6px" sx={{ overflowX: 'auto' }}>
                      {sortTaskByDescendingOrder<TaskResponse>(filterTaskWithWorkflowStateId(list.id)).map((task, index) => {
                        return (
                          <CustomLink
                            key={task.id}
                            href={{ pathname: getCardHref(task), query: { token } }}
                            style={{ width: 'fit-content' }}
                          >
                            <DragDropHandler
                              key={task.id}
                              accept={'taskCard'}
                              index={index}
                              task={task}
                              draggable // Make TaskCard draggable
                            >
                              <Box key={task.id}>
                                <TaskCard
                                  task={task}
                                  key={task.id}
                                  href={{ pathname: getCardHref(task), query: { token } }}
                                />
                              </Box>
                            </DragDropHandler>
                          </CustomLink>
                        )
                      })}
                    </Stack>
                  </CustomScrollbar>
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
          <CustomScrollbar style={{ width: '8px' }}>
            {workflowStates.map((list, index) => (
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
                      <CustomLink key={task.id} href={{ pathname: getCardHref(task), query: { token } }}>
                        <DragDropHandler
                          key={task.id}
                          accept={'taskCard'}
                          index={index}
                          task={task}
                          draggable // Make ListViewTaskCard draggable
                        >
                          <ListViewTaskCard
                            key={task.id}
                            task={task}
                            href={{ pathname: getCardHref(task), query: { token } }}
                            updateTask={({ payload }) => {
                              updateTask({ token: z.string().parse(token), taskId: task.id, payload })
                            }}
                          />
                        </DragDropHandler>
                      </CustomLink>
                    )
                  })}
                </TaskRow>
              </DragDropHandler>
            ))}
          </CustomScrollbar>
        </Stack>
      )}
      <CustomDragLayer>
        <CardDragLayer />
      </CustomDragLayer>
    </>
  )
}
