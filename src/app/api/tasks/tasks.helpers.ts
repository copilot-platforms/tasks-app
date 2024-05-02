import { NotificationTaskActions, TaskTimestamps } from '@api/core/types/tasks'
import { AssigneeType, StateType, Task, WorkflowState } from '@prisma/client'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { ClientResponseSchema, CompanyResponse, CompanyResponseSchema, CopilotUser } from '@/types/common'
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
  let recipientIds: string[]
  // The IU/client/company that triggered this notification
  let sender: CopilotUser | CompanyResponse
  const assigneeId = z.string().parse(task.assigneeId)

  const getTaskCompletionRecipients = async (task: Task, sender: CopilotUser | CompanyResponse): Promise<string[]> => {
    // If task is completed by IU, only notify the IU that created the task
    if (task.assigneeType === AssigneeType.internalUser) {
      return [task.createdBy]
    }

    let companyId: string
    if (task.assigneeType === AssigneeType.client) {
      // If task is completed by client, fetch all IUs with company access to client's company
      // NOTE: If client does not have a company, a unique companyId is still provided to that client
      companyId = ClientResponseSchema.parse(sender).companyId
    } else {
      companyId = CompanyResponseSchema.parse(sender).id
    }
    const internalUsers = (await copilot.getInternalUsers()).data
    return (
      internalUsers
        // If client access is limited then check their companyAccessList if it has been specifically provided
        .filter((internalUser) => !internalUser.isClientAccessLimited || internalUser.companyAccessList?.includes(companyId))
        .map((internalUser) => internalUser.id)
    )
  }

  // Get info of the iu/client/company that a task was assigned to
  const getAssignedTo = async (id: string) => {
    if (task.assigneeType === AssigneeType.internalUser) {
      return await copilot.getInternalUser(id)
    } else if (task.assigneeType === AssigneeType.client) {
      return await copilot.getClient(id)
    } else {
      return await copilot.getCompany(id)
    }
  }

  if (action === NotificationTaskActions.Assigned) {
    // Notification is sent by the person creating the task to the one it is assigned to.
    senderId = task.createdBy
    recipientIds = [assigneeId]
    // Notification action is triggered by the IU creating the task.
    sender = await copilot.getInternalUser(senderId)
  } else {
    senderId = assigneeId
    // Notify all IUs who have access to this client's company
    // Since assignees can be company / iu / client, query details of who it was assigned to
    sender = await getAssignedTo(senderId)
    recipientIds = await getTaskCompletionRecipients(task, sender)
  }

  // Get the name of the IU / client / company that triggered this notification
  const actionUser =
    task.assigneeType === AssigneeType.company
      ? CompanyResponseSchema.parse(sender).name
      : `${(sender as CopilotUser).givenName} ${(sender as CopilotUser).familyName}`

  return { senderId, recipientIds, actionUser }
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
