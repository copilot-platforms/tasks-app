'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { Box, Stack } from '@mui/material'
import { TaskCard } from '@/components/cards/TaskCard'
import { TaskColumn } from '@/components/cards/TaskColumn'
import { DragDropHandler } from '@/hoc/DragDropHandler'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { useSelector } from 'react-redux'
import store from '@/redux/store'
import { selectTaskBoard, setTasks, updateWorkflowStateIdByTaskId } from '@/redux/features/taskBoardSlice'
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

export const TaskBoard = () => {
  const { workflowStates, tasks, token, filteredTasks: _filteredTasks, view, filterOptions } = useSelector(selectTaskBoard)

  const filteredTasks = useMemo(() => {
    return [..._filteredTasks].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateA - dateB
    })
  }, [tasks, _filteredTasks])
  console.log('filteredTask', filteredTasks)

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

  /**
   * This function is responsible for returning the tasks that matches the workflowStateId of the workflowState
   */
  const filterTaskWithWorkflowStateId = (workflowStateId: string): TaskResponse[] => {
    return filteredTasks.filter((task) => task.workflowStateId === workflowStateId)
  }

  /**
   * This function is responsible for calculating the task count based on the workflowStateId
   */
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
  return (
    <>
      <Header showCreateTaskButton={true} />
      <FilterBar
        updateViewModeSetting={async (payload: CreateViewSettingsDTO) => {
          await updateViewModeSettings(z.string().parse(token), payload)
        }}
      />
      {view === View.BOARD_VIEW && (
        <Box sx={{ padding: '20px 20px' }}>
          <Stack
            columnGap={6}
            sx={{
              flexDirection: 'row',
              overflowX: 'auto',
            }}
          >
            {workflowStates.map((list, index) => (
              <DragDropHandler key={list.id} accept={'taskCard'} index={index} id={list.id} onDropItem={onDropItem}>
                <TaskColumn key={list.id} columnName={list.name} taskCount={taskCountForWorkflowStateId(list.id)}>
                  <CustomScrollbar style={{ padding: '4px' }}>
                    <Stack direction="column" rowGap="6px" sx={{ overflowX: 'auto' }}>
                      {filterTaskWithWorkflowStateId(list.id).map((task, index) => {
                        return (
                          <DragDropHandler key={task.id} accept={'taskCard'} index={index} id={task.id || ''} draggable>
                            <Box key={task.id}>
                              <TaskCard
                                task={task}
                                key={task.id}
                                href={{ pathname: `/detail/${task.id}/iu`, query: { token } }}
                              />
                            </Box>
                          </DragDropHandler>
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

      {view === View.LIST_VIEW && (
        <Stack
          sx={{
            flexDirection: 'column',
            height: 'calc(100vh - 135px)',
          }}
        >
          <CustomScrollbar style={{ width: '8px' }}>
            {workflowStates.map((list, index) => (
              <DragDropHandler key={list.id} accept={'taskCard'} index={index} id={list.id} onDropItem={onDropItem}>
                <TaskRow
                  key={list.id}
                  columnName={list.name}
                  taskCount={taskCountForWorkflowStateId(list.id)}
                  showConfigurableIcons={false}
                  display={!!filterTaskWithWorkflowStateId(list.id).length}
                >
                  {filterTaskWithWorkflowStateId(list.id).map((task, index) => {
                    return (
                      <DragDropHandler key={task.id} accept={'taskCard'} index={index} id={task.id || ''} draggable>
                        <ListViewTaskCard
                          key={task.id}
                          task={task}
                          href={{ pathname: `/detail/${task.id}/iu`, query: { token } }}
                          updateTask={({ payload }) => {
                            updateTask({ token: z.string().parse(token), taskId: task.id, payload })
                          }}
                        />
                      </DragDropHandler>
                    )
                  })}
                </TaskRow>
              </DragDropHandler>
            ))}
          </CustomScrollbar>
        </Stack>
      )}
    </>
  )
}
