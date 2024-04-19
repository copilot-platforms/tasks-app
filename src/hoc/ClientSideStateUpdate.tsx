'use client'

import { setTasks, setWorkflowStates } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { ReactNode, useEffect } from 'react'

/**
 * This HOC is responsible in updating the client side state of the responses that are fetched in the server components.
 * The purpose of this HOC is to avoid prop drilling from server component to client component. Fetched response data from
 * the server component is used in the client component to achieve the functionalities of the task app.
 */
export const ClientSideStateUpdate = ({
  children,
  workflowStates,
  tasks,
}: {
  children: ReactNode
  workflowStates: WorkflowStateResponse[]
  tasks: TaskResponse[]
}) => {
  useEffect(() => {
    if (workflowStates) {
      store.dispatch(setWorkflowStates(workflowStates))
    }

    if (tasks) {
      store.dispatch(setTasks(tasks))
    }
  }, [workflowStates, tasks])

  return children
}
