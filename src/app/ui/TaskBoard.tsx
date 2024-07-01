'use client'

import { useCallback } from 'react'
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
import { CreateTaskRequestSchema, TaskResponse } from '@/types/dto/tasks.dto'
import { ListViewTaskCard } from '@/components/cards/ListViewTaskCard'
import { TaskRow } from '@/components/cards/TaskRow'
import { ISignedUrlUpload, View } from '@/types/interfaces'
import { handleCreate, updateTask } from '@/app/actions'
import { z } from 'zod'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { bulkRemoveAttachments } from '@/utils/bulkRemoveAttachments'

export const TaskBoard = ({
  getSignedUrlUpload,
  handleCreateMultipleAttachments,
}: {
  getSignedUrlUpload: (fileName: string) => Promise<ISignedUrlUpload>
  handleCreateMultipleAttachments: (attachments: CreateAttachmentRequest[]) => Promise<void>
}) => {
  const { showModal } = useSelector(selectCreateTask)
  const { workflowStates, tasks, token, filteredTasks, view, filterOptions } = useSelector(selectTaskBoard)
  const { title, description, workflowStateId, assigneeId, assigneeType, attachments } = useSelector(selectCreateTask)

  const router = useRouter()

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

  return (
    <>
      {view === View.BOARD_VIEW && (
        <AppMargin size={SizeofAppMargin.LARGE} py="20px">
          <Stack
            columnGap={6}
            sx={{
              overflowX: 'auto',
              flexDirection: 'row',
            }}
          >
            {workflowStates.map((list, index) => (
              <DragDropHandler key={list.id} accept={'taskCard'} index={index} id={list.id} onDropItem={onDropItem}>
                <TaskColumn key={list.id} columnName={list.name} taskCount={taskCountForWorkflowStateId(list.id)}>
                  <Box mt="6px">
                    {filterTaskWithWorkflowStateId(list.id).map((task, index) => {
                      return (
                        <DragDropHandler key={task.id} accept={'taskCard'} index={index} id={task.id || ''} draggable>
                          <Box onClick={() => router.push(`/detail/${task.id}/iu?token=${token}`)} key={task.id} m="6px 0px">
                            <TaskCard task={task} key={task.id} />
                          </Box>
                        </DragDropHandler>
                      )
                    })}
                  </Box>
                </TaskColumn>
              </DragDropHandler>
            ))}
          </Stack>
        </AppMargin>
      )}

      {view === View.LIST_VIEW && (
        <Stack
          sx={{
            overflowX: 'auto',
            flexDirection: 'column',
          }}
        >
          {workflowStates.map((list, index) => (
            <DragDropHandler key={list.id} accept={'taskCard'} index={index} id={list.id} onDropItem={onDropItem}>
              <TaskRow
                key={list.id}
                columnName={list.name}
                taskCount={taskCountForWorkflowStateId(list.id)}
                showConfigurableIcons={false}
              >
                {filterTaskWithWorkflowStateId(list.id).map((task, index) => {
                  return (
                    <DragDropHandler key={task.id} accept={'taskCard'} index={index} id={task.id || ''} draggable>
                      <ListViewTaskCard
                        task={task}
                        key={task.id}
                        updateTask={({ payload }) => {
                          updateTask({ token: z.string().parse(token), taskId: task.id, payload })
                        }}
                        handleClick={() => router.push(`/detail/${task.id}/iu?token=${token}`)}
                      />
                    </DragDropHandler>
                  )
                })}
              </TaskRow>
            </DragDropHandler>
          ))}
        </Stack>
      )}

      <Modal
        open={showModal}
        onClose={async () => {
          store.dispatch(setShowModal())
          store.dispatch(clearCreateTaskFields())
          await bulkRemoveAttachments(attachments)
        }}
        aria-labelledby="create-task-modal"
        aria-describedby="add-new-task"
      >
        <NewTaskForm
          handleCreate={async () => {
            if (title) {
              store.dispatch(setShowModal())
              store.dispatch(clearCreateTaskFields())
              const createdTask = await handleCreate(
                token as string,
                CreateTaskRequestSchema.parse({ title, body: description, workflowStateId, assigneeType, assigneeId }),
              )
              const toUploadAttachments: CreateAttachmentRequest[] = attachments.map((el) => {
                return {
                  ...el,
                  taskId: createdTask.id,
                }
              })
              store.dispatch(clearCreateTaskFields())
              await handleCreateMultipleAttachments(toUploadAttachments)
            }
          }}
          getSignedUrlUpload={getSignedUrlUpload}
        />
      </Modal>
    </>
  )
}
