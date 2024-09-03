'use client'

import { useCallback } from 'react'
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

export const TaskBoard = () => {
  const { workflowStates, tasks, token, filteredTasks, view, viewSettingsTemp, filterOptions } = useSelector(selectTaskBoard)

  const onDropItem = useCallback(
    (payload: { taskId: string; targetWorkflowStateId: string }) => {
      const { taskId, targetWorkflowStateId } = payload
      store.dispatch(updateWorkflowStateIdByTaskId({ taskId, targetWorkflowStateId }))
      updateTask({
        token: z.string().parse(token),
        taskId,
        payload: { workflowStateId: targetWorkflowStateId },
      })
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
    return filteredTaskCount.toString() + '/' + taskCount.toString()
  }

  if (tasks && tasks.length === 0) {
    return <DashboardEmptyState userType={UserType.INTERNAL_USER} />
  }

  const viewBoardSettings = viewSettingsTemp ? viewSettingsTemp.viewMode : view
  return (
    <>
      <Header showCreateTaskButton={true} />
      <FilterBar
        updateViewModeSetting={async (payload: CreateViewSettingsDTO) => {
          await updateViewModeSettings(z.string().parse(token), payload)
        }}
      />
      {viewBoardSettings === View.BOARD_VIEW && (
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
              >
                <TaskColumn key={list.id} columnName={list.name} taskCount={taskCountForWorkflowStateId(list.id)}>
                  <CustomScrollbar style={{ padding: '4px' }}>
                    <Stack direction="column" rowGap="6px" sx={{ overflowX: 'auto' }}>
                      {sortTaskByDescendingOrder(filterTaskWithWorkflowStateId(list.id)).map((task, index) => {
                        return (
                          <CustomLink
                            key={task.id}
                            href={{ pathname: `/detail/${task.id}/iu`, query: { token } }}
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
                                  href={{ pathname: `/detail/${task.id}/iu`, query: { token } }}
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

      {viewBoardSettings === View.LIST_VIEW && (
        <Stack
          sx={{
            flexDirection: 'column',
            height: 'calc(100vh - 135px)',
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
                  key={list.id}
                  columnName={list.name}
                  taskCount={taskCountForWorkflowStateId(list.id)}
                  showConfigurableIcons={false}
                  display={!!filterTaskWithWorkflowStateId(list.id).length}
                >
                  {sortTaskByDescendingOrder(filterTaskWithWorkflowStateId(list.id)).map((task, index) => {
                    return (
                      <CustomLink key={task.id} href={{ pathname: `/detail/${task.id}/iu`, query: { token } }}>
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
                            href={{ pathname: `/detail/${task.id}/iu`, query: { token } }}
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
