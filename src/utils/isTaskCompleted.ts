'use client'

import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { StateType } from '@prisma/client'

export const isTaskCompleted = (task: TaskResponse, workflowStates: WorkflowStateResponse[]): boolean => {
  return workflowStates?.find((workflowState) => workflowState.id == task.workflowStateId)?.type === StateType.completed
}
