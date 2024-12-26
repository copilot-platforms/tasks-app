import { TaskTimestamps } from '@api/core/types/tasks'
import { ActivityType, StateType, Task, WorkflowState } from '@prisma/client'
import User from '@api/core/models/User.model'
import { CreateTaskRequest, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import WorkflowStatesService from '@api/workflow-states/workflowStates.service'
import { ActivityLogger } from '../activity-logs/services/activity-logger.service'
import { WorkflowStateUpdatedSchema } from '../activity-logs/schemas/WorkflowStateUpdatedSchema'

export const getArchivedStatus = (showArchived: boolean, showUnarchived: boolean): undefined | boolean => {
  if (showArchived && !showUnarchived) {
    return true
  } else if (showUnarchived && !showArchived) {
    return false
  }
  return undefined
}

/**
 * Reusable function to get assignedAt & completedAt time for a task create / update action
 * @param mode 'create' | 'update' as per action
 * @param user Current request user
 * @param data Create or Update data object
 * @param prevData Optional previous task data to be provided when updating a task
 * @returns
 */
export const getTaskTimestamps = async (
  mode: 'create' | 'update',
  user: User,
  data: CreateTaskRequest | UpdateTaskRequest,
  prevData?: Task & { workflowState: WorkflowState },
): Promise<TaskTimestamps> => {
  const workflowStateService = new WorkflowStatesService(user)

  // Handle situations where task workspaceId is not provided for create or PATCH update
  let workflowStateStatus: StateType | undefined
  if (data.workflowStateId) {
    workflowStateStatus = (await workflowStateService.getOneWorkflowState(data.workflowStateId))?.type
  }

  const curDate = new Date()
  const freshTimestamps: TaskTimestamps = {
    assignedAt: data.assigneeId ? curDate : null,
    completedAt: workflowStateStatus === StateType.completed ? curDate : null,
  }

  if (mode === 'create') {
    return freshTimestamps
  }

  // If assignee or workflow type has not been changed from previous update
  // i.e. both prev and current Task data has the same assignee or workflow type value then don't change them
  const previousTask = prevData as Task
  return {
    assignedAt:
      data.assigneeId === undefined || previousTask.assigneeId === data.assigneeId
        ? previousTask.assignedAt
        : freshTimestamps.assignedAt,
    // The freshTimestamps.assignedAt part is to handle case when task previously had an assignee
    // and now is unassigned
    completedAt:
      data.workflowStateId === undefined || previousTask.workflowStateId === data.workflowStateId
        ? previousTask.completedAt
        : freshTimestamps.completedAt,
  }
}
