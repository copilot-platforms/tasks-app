'use client'

import { useCallback, useEffect } from 'react'
import { Box, Modal, Stack } from '@mui/material'
import { TaskCard } from '@/components/cards/TaskCard'
import { TaskColumn } from '@/components/cards/TaskColumn'
import { DragDropHandler } from '@/hoc/DragDropHandler'
import { NewTaskForm } from '@/app/ui/NewTaskForm'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { useSelector } from 'react-redux'
import { clearCreateTaskFields, selectCreateTask, setShowModal } from '@/redux/features/createTaskSlice'
import store from '@/redux/store'
import { useRouter } from 'next/navigation'
import { selectTaskBoard, updateWorkflowStateIdByTaskId } from '@/redux/features/taskBoardSlice'
import { CreateTaskRequest, CreateTaskRequestSchema, TaskResponse, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { ListViewTaskCard } from '@/components/cards/ListViewTaskCard'
import { TaskRow } from '@/components/cards/TaskRow'
import { View } from '@/types/interfaces'
import { handleCreate, updateTask } from '../actions'
import { z } from 'zod'

export const TaskBoard = ({}: {}) => {
  const { showModal } = useSelector(selectCreateTask)
  const { workflowStates, tasks, token, filteredTasks, view, filterOptions } = useSelector(selectTaskBoard)
  const { title, description, workflowStateId, assigneeId, assigneeType } = useSelector(selectCreateTask)

  const router = useRouter()

  const onDropItem = useCallback((payload: { taskId: string; targetWorkflowStateId: string }) => {
    store.dispatch(
      updateWorkflowStateIdByTaskId({ taskId: payload.taskId, targetWorkflowStateId: payload.targetWorkflowStateId }),
    )
    updateTask({
      token: z.string().parse(token),
      taskId: payload.taskId,
      payload: { workflowStateId: payload.targetWorkflowStateId },
    })
  }, [])

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

  return (
    <AppMargin size={SizeofAppMargin.LARGE} py="18.5px">
      <Stack
        columnGap={2}
        sx={{
          overflowX: 'auto',
          flexDirection: view === View.BOARD_VIEW ? 'row' : 'column',
        }}
      >
        {workflowStates.map((list, index) => {
          if (view === View.BOARD_VIEW) {
            return (
              <DragDropHandler key={list.id} accept={'taskCard'} index={index} id={list.id} onDropItem={onDropItem}>
                <TaskColumn key={list.id} columnName={list.name} taskCount={taskCountForWorkflowStateId(list.id)}>
                  {filterTaskWithWorkflowStateId(list.id).map((task, index) => {
                    return (
                      <DragDropHandler key={task.id} accept={'taskCard'} index={index} id={task.id || ''}>
                        <Box onClick={() => router.push(`/detail/${task.id}/iu?token=${token}`)} key={task.id} m="6px 0px">
                          <TaskCard task={task} key={task.id} />
                        </Box>
                      </DragDropHandler>
                    )
                  })}
                </TaskColumn>
              </DragDropHandler>
            )
          }
          if (view === View.LIST_VIEW) {
            return (
              <DragDropHandler key={list.id} accept={'taskCard'} index={index} id={list.id} onDropItem={onDropItem}>
                <TaskRow
                  key={list.id}
                  columnName={list.name}
                  taskCount={taskCountForWorkflowStateId(list.id)}
                  showConfigurableIcons={false}
                >
                  {filterTaskWithWorkflowStateId(list.id).map((task, index) => {
                    return (
                      <DragDropHandler key={task.id} accept={'taskCard'} index={index} id={task.id || ''}>
                        <Box key={task.id} m="6px 0px">
                          <ListViewTaskCard
                            task={task}
                            key={task.id}
                            updateTask={({ payload }) => {
                              updateTask({ token: z.string().parse(token), taskId: task.id, payload })
                            }}
                            handleClick={() => router.push(`/detail/${task.id}/iu?token=${token}`)}
                          />
                        </Box>
                      </DragDropHandler>
                    )
                  })}
                </TaskRow>
              </DragDropHandler>
            )
          }
        })}

        <Modal
          open={showModal}
          onClose={() => {
            store.dispatch(setShowModal())
            store.dispatch(clearCreateTaskFields())
          }}
          aria-labelledby="create-task-modal"
          aria-describedby="add-new-task"
        >
          <NewTaskForm
            handleCreate={async () => {
              if (title) {
                store.dispatch(setShowModal())
                store.dispatch(clearCreateTaskFields())
                await handleCreate(
                  token as string,
                  CreateTaskRequestSchema.parse({ title, body: description, workflowStateId, assigneeType, assigneeId }),
                )
              }
            }}
          />
        </Modal>
      </Stack>
    </AppMargin>
  )
}
