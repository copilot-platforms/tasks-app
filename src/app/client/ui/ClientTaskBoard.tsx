'use client'

import { ClientTaskCard } from '@/components/cards/ClientTaskCard'
import { TaskRow } from '@/components/cards/TaskRow'
import { selectTaskBoard, updateWorkflowStateIdByTaskId } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { Box } from '@mui/material'
import { useSelector } from 'react-redux'
import { StateType } from '@prisma/client'
import DashboardEmptyState from '@/components/layouts/EmptyState/DashboardEmptyState'
import { UserType } from '@/types/interfaces'
import { Header } from '@/components/layouts/Header'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { useMemo } from 'react'
import { completeTask } from '../actions'
import { z } from 'zod'
import { CustomLink } from '@/hoc/CustomLink'

export const ClientTaskBoard = () => {
  const { workflowStates, tasks, token } = useSelector(selectTaskBoard)
  const { tokenPayload } = useSelector(selectAuthDetails)

  const filteredTask = useMemo(() => {
    return tasks.filter((task) => {
      if (task.assigneeId === tokenPayload?.clientId || task.assigneeId === tokenPayload?.companyId) return true
    })
  }, [tasks])

  /**
   * This function is responsible for returning the tasks that matches the workflowStateId of the workflowState and assigneeType
   */
  const filterTaskWithWorkflowStateId = (workflowStateId: string): TaskResponse[] => {
    return filteredTask.filter((task) => task.workflowStateId === workflowStateId)
  }

  /**
   * This function is responsible for calculating the task count based on the workflowStateId
   */
  const taskCountForWorkflowStateId = (workflowStateId: string): string => {
    return filteredTask.filter((task) => task.workflowStateId === workflowStateId).length.toString()
  }

  const completedTypeWorkflowState = workflowStates.find((el) => el.type === 'completed')
  return tasks.length > 0 ? (
    <>
      <Header showCreateTaskButton={false} />
      {workflowStates.map((list) => {
        return (
          <TaskRow
            key={list.id}
            columnName={list.name}
            taskCount={taskCountForWorkflowStateId(list.id)}
            showConfigurableIcons={false}
          >
            {filterTaskWithWorkflowStateId(list.id).map((task) => {
              return (
                <CustomLink
                  key={task.id}
                  href={{ pathname: `/detail/${task.id}/cu`, query: { token } }}
                  style={{ width: 'fit-content' }}
                >
                  <Box key={task.id}>
                    <ClientTaskCard
                      task={task}
                      href={{ pathname: `/detail/${task.id}/cu`, query: { token } }}
                      key={task.id}
                      markdoneFlag={list.type == StateType.completed}
                      handleMarkDone={async () => {
                        if (completedTypeWorkflowState?.id) {
                          store.dispatch(
                            updateWorkflowStateIdByTaskId({
                              taskId: task.id,
                              targetWorkflowStateId: completedTypeWorkflowState?.id,
                            }),
                          )
                          await completeTask({ token: z.string().parse(token), taskId: task.id })
                        }
                      }}
                    />
                  </Box>
                </CustomLink>
              )
            })}
          </TaskRow>
        )
      })}
    </>
  ) : (
    <DashboardEmptyState userType={UserType.CLIENT_USER} />
  )
}
