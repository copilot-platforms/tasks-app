import { NotificationTaskActions, TaskTimestamps } from '@api/core/types/tasks'
import { AssigneeType, StateType, Task, WorkflowState } from '@prisma/client'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { CompanyResponse, CopilotUser } from '@/types/common'
import { z } from 'zod'
import User from '@api/core/models/User.model'
import { CreateTaskRequest, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import WorkflowStatesService from '@api/workflow-states/workflowStates.service'

/**
 * Helper function that sets the in-product notification title and body for a given notification trigger
 * @param actionUser The user's name that triggered this action.
 */
export const getInProductNotificationDetails = (actionUser: string) => {
  return {
    [NotificationTaskActions.Assigned]: {
      title: 'Task was assigned to you',
      body: `A new task was assigned to you by ${actionUser}. To see details about the task, navigate to the Tasks App below.`,
    },
    [NotificationTaskActions.Completed]: {
      title: 'A client completed a task',
      body: `A new task was completed by ${actionUser}. You are receiving this notification because you have access to the client.`,
    },
  }
}

/**
 * Helper function that sets the notification email details for a given notification trigger
 * @param actionUser The user's name that triggered this action.
 * TODO: Right now its the same as in-product details, change this after finalizing email details
 */
export const getEmailDetails = (actionUser: string) => {
  return {
    [NotificationTaskActions.Assigned]: {
      title: 'Task was assigned to you',
      subject: 'Task was assigned to you',
      header: 'Task was assigned to you',
      body: `A new task was assigned to you by ${actionUser}. To see details about the task, navigate to the Tasks App below.`,
    },
    [NotificationTaskActions.Completed]: {
      title: 'A client completed a task',
      subject: 'A client completed a task',
      header: 'A client completed a task',
      body: `A new task was completed by ${actionUser}. You are receiving this notification because you have access to the client.`,
    },
  }
}

/**
 * Get the concerned sender and reciever for a notification based on the action that triggered it
 */
export const getNotificationParties = async (copilot: CopilotAPI, task: Task, action: NotificationTaskActions) => {
  let senderId: string
  let recipientId: string
  // The IU/client/company that triggered this notification
  let actionTrigger: CopilotUser | CompanyResponse

  // Get info of the iu/client/company that a task was assigned to
  const getAssignedTo = async () => {
    if (task.assigneeType === AssigneeType.internalUser) {
      return await copilot.getInternalUser(senderId)
    } else if (task.assigneeType === AssigneeType.client) {
      return await copilot.getClient(recipientId)
    } else {
      return await copilot.getCompany(recipientId)
    }
  }

  if (action === NotificationTaskActions.Assigned) {
    // Notification is sent by the person creating the task to the one it is assigned to.
    senderId = task.createdById
    recipientId = z.string().parse(task.assigneeId)
    // Notification action is triggered by the IU creating the task.
    actionTrigger = await copilot.getInternalUser(senderId)
  } else {
    // Notify the IU who created this task with the client / company as sender
    senderId = z.string().parse(task.assigneeId)
    recipientId = task.createdById
    // Since assignees can be company / iu / client, query details of who it was assigned to
    actionTrigger = await getAssignedTo()
  }

  // Get the name of the IU / client / company that triggered this notification
  const actionUser =
    task.assigneeType === AssigneeType.company
      ? (actionTrigger as CompanyResponse).name
      : `${(actionTrigger as CopilotUser).givenName} ${(actionTrigger as CopilotUser).familyName}`

  return { senderId, recipientId, actionUser }
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
