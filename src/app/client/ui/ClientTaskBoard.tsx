'use client'

import { ClientTaskCard } from '@/components/cards/ClientTaskCard'
import { TaskRow } from '@/components/cards/TaskRow'
import { selectTaskBoard, updateWorkflowStateIdByTaskId } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { TaskResponse, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { Box } from '@mui/material'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { StateType } from '@prisma/client'
import { advancedFeatureFlag } from '@/config'

export const ClientTaskBoard = ({ completeTask }: { completeTask: (taskId: string) => void }) => {
  const { workflowStates, tasks, filteredTasks, token } = useSelector(selectTaskBoard)

  const router = useRouter()

  /**
   * This function is responsible for returning the tasks that matches the workflowStateId of the workflowState
   */
  const filterTaskWithWorkflowStateId = (workflowStateId: string): TaskResponse[] => {
    return tasks.filter((task) => task.workflowStateId === workflowStateId)
  }

  /**
   * This function is responsible for calculating the task count based on the workflowStateId
   */
  const taskCountForWorkflowStateId = (workflowStateId: string): string => {
    return tasks.filter((task) => task.workflowStateId === workflowStateId).length.toString()
  }

  const completedTypeWorkflowState = workflowStates.find((el) => el.type === 'completed')
  return workflowStates.map((list) => {
    return (
      <TaskRow
        key={list.id}
        columnName={list.name}
        taskCount={taskCountForWorkflowStateId(list.id)}
        showConfigurableIcons={false}
      >
        {filterTaskWithWorkflowStateId(list.id).map((task) => {
          return (
            <Box key={task.id} m="6px 0px">
              <ClientTaskCard
                task={task}
                key={task.id}
                markdoneFlag={list.type == StateType.completed}
                handleMarkDone={() => {
                  if (completedTypeWorkflowState?.id) {
                    store.dispatch(
                      updateWorkflowStateIdByTaskId({
                        taskId: task.id,
                        targetWorkflowStateId: completedTypeWorkflowState?.id,
                      }),
                    )
                    completeTask(task.id)
                  }
                }}
                handleRouteChange={() => advancedFeatureFlag && router.push(`/detail/${task.id}/cu?token=${token}`)}
              />
            </Box>
          )
        })}
      </TaskRow>
    )
  })
}
