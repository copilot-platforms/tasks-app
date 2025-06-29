import { queueTaskUpdatedBacklogWebhook } from '@/jobs/webhook-dispatch'
import DBClient from '@/lib/db'
import { TaskWithWorkflowState } from '@/types/db'
import { CreateTaskRequest, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { DISPATCHABLE_EVENT } from '@/types/webhook'
import { CopilotAPI } from '@/utils/CopilotAPI'
import User from '@api/core/models/User.model'
import { TaskTimestamps } from '@api/core/types/tasks'
import { PublicTaskSerializer } from '@api/tasks/public/public.serializer'
import WorkflowStatesService from '@api/workflow-states/workflowStates.service'
import { LogStatus, StateType, Task, WorkflowState } from '@prisma/client'

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
  const workflowStateService = new WorkflowStatesService({ user })

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

export const dispatchUpdatedWebhookEvent = async (
  user: User,
  prevTask: Task,
  updatedTask: TaskWithWorkflowState,
  isPublicApi: boolean,
): Promise<void> => {
  let event: DISPATCHABLE_EVENT | undefined
  const copilot = new CopilotAPI(user.token)

  let isDispatchableUpdateChange =
    prevTask.assigneeId !== updatedTask.assigneeId ||
    prevTask.title !== updatedTask.title ||
    prevTask.workflowStateId !== updatedTask.workflowStateId ||
    prevTask.dueDate !== updatedTask.dueDate

  if (isPublicApi) {
    isDispatchableUpdateChange = isDispatchableUpdateChange || prevTask.body !== updatedTask.body
  }

  if (isDispatchableUpdateChange) {
    event =
      updatedTask.workflowState.type === StateType.completed
        ? DISPATCHABLE_EVENT.TaskCompleted
        : DISPATCHABLE_EVENT.TaskUpdated
  }

  if (prevTask.isArchived !== updatedTask.isArchived) {
    event = updatedTask.isArchived ? DISPATCHABLE_EVENT.TaskArchived : DISPATCHABLE_EVENT.TaskUpdated
  }

  if (event) {
    await copilot.dispatchWebhook(event, {
      workspaceId: user.workspaceId,
      payload: PublicTaskSerializer.serialize(updatedTask),
    })
  }
}

export const queueBodyUpdatedWebhook = async (user: User, task: TaskWithWorkflowState): Promise<void> => {
  const db = DBClient.getInstance()
  const prevBacklogsForTask = await db.taskUpdateBacklog.count({
    where: {
      taskId: task.id,
      status: LogStatus.waiting,
    },
  })
  // Probably not a good idea to do both in parallel
  await db.taskUpdateBacklog.create({ data: { taskId: task.id } })

  if (!prevBacklogsForTask) {
    await queueTaskUpdatedBacklogWebhook.trigger({ user, taskId: task.id }, { delay: '10s' })
  }
}
