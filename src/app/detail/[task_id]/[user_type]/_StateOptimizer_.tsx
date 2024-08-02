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

    if (currentTask) {
      store.dispatch(setStateOptimizers_taskDetailsSlice({ currentTask }))
    }

    if (currentWorkflowState) {
      store.dispatch(setStateOptimizers_taskDetailsSlice({ currentWorkflowState }))
    }

    if (currentAssignee) {
      store.dispatch(setStateOptimizers_taskDetailsSlice({ currentAssignee }))
    }
  }, [tasks, workflowStates, assignee])

  return children
}
