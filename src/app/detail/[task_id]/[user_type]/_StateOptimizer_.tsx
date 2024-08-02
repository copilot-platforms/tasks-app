'use client'

import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { setStateOptimizers_taskDetailsSlice } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'
import { ReactNode, useMemo } from 'react'
import { useSelector } from 'react-redux'

export const StateOptimizer = ({ task_id, children }: { task_id: string; children: ReactNode }) => {
  const { tasks, workflowStates, assignee } = useSelector(selectTaskBoard)

  useMemo(() => {
    const currentTask = tasks.find((el) => el.id === task_id)
    const currentWorkflowState = workflowStates.find((el) => el?.id === currentTask?.workflowStateId)
    const currentAssignee = assignee.find((el) => el.id === currentTask?.assigneeId)

    store.dispatch(
      setStateOptimizers_taskDetailsSlice({
        currentTask: tasks[0],
        currentWorkflowState: workflowStates[0],
        currentAssignee: assignee[0],
      }),
    )
  }, [tasks, workflowStates, assignee])

  return children
}
