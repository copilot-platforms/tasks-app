'use client'

import { useCallback } from 'react'
import { Box, Modal, Stack } from '@mui/material'
import { TaskCard } from '@/components/cards/TaskCard'
import { TaskColumn } from '@/components/cards/TaskColumn'
import { DragDropHandler } from '@/hoc/DragDropHandler'
import { NewTaskForm } from '@/app/ui/NewTaskForm'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { useSelector } from 'react-redux'
import { selectCreateTask, setShowModal } from '@/redux/features/createTaskSlice'
import store from '@/redux/store'
import { useRouter } from 'next/navigation'
import { selectTaskBoard, updateWorkflowStateIdByTaskId } from '@/redux/features/taskBoardSlice'
import { encodeToParamString } from '@/utils/generateParamString'
import { TaskResponse } from '@/types/dto/tasks.dto'

export const TaskBoard = ({ handleCreate }: { handleCreate: Function }) => {
  const { showModal } = useSelector(selectCreateTask)
  const { workflowStates, tasks } = useSelector(selectTaskBoard)
  console.log('wwww', workflowStates)

  const router = useRouter()

  const onDropItem = useCallback(
    (payload: { taskId: string; targetWorkflowStateId: string }) => {
      store.dispatch(
        updateWorkflowStateIdByTaskId({ taskId: payload.taskId, targetWorkflowStateId: payload.targetWorkflowStateId }),
      )
    },
    [tasks],
  )

  /**
   * This function is responsible for returning the tasks that matches the workflowStateId of the workflowState
   */
  const filterTaskWithWorkflowStateId = (workflowStateId: string): TaskResponse[] => {
    return tasks.filter((task) => task.workflowStateId === workflowStateId)
  }

  /**
   * This function is responsible for calculating the task count based on the workflowStateId
   */
  const calculateTaskCountBasedOnWorkflowStateId = (workflowStateId: string): number => {
    return tasks.filter((task) => task.workflowStateId === workflowStateId).length
  }

  return (
    <AppMargin size={SizeofAppMargin.LARGE} py="18.5px">
      <Stack
        direction="row"
        columnGap={2}
        sx={{
          overflowX: 'auto',
        }}
      >
        {workflowStates.map((list, index) => {
          return (
            <DragDropHandler key={list.id} accept={'taskCard'} index={index} id={list.id} onDropItem={onDropItem}>
              <TaskColumn key={list.id} columnName={list.name} taskCount={calculateTaskCountBasedOnWorkflowStateId(list.id)}>
                {filterTaskWithWorkflowStateId(list.id).map((task, index) => {
                  return (
                    <DragDropHandler key={task.id} accept={'taskCard'} index={index} id={task.id || ''}>
                      <Box
                        onClick={() => router.push(`/detail/${task.id}/${encodeToParamString(task.title || '')}/iu`)}
                        key={task.id}
                        m="6px 0px"
                      >
                        <TaskCard task={task} key={task.id} />
                      </Box>
                    </DragDropHandler>
                  )
                })}
              </TaskColumn>
            </DragDropHandler>
          )
        })}

        <Modal
          open={showModal}
          onClose={() => {
            store.dispatch(setShowModal())
          }}
          aria-labelledby="create-task-modal"
          aria-describedby="add-new-task"
        >
          <NewTaskForm handleCreate={handleCreate} />
        </Modal>
      </Stack>
    </AppMargin>
  )
}
