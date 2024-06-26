import { CreateTaskRequest, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { BaseService } from '@api/core/services/base.service'
import { Resource } from '@api/core/types/api'
import { PoliciesService } from '@api/core/services/policies.service'
import { ActivityType, StateType, AssigneeType } from '@prisma/client'
import { UserAction, UserRole } from '@api/core/types/user'
import { NotificationTaskActions } from '@api/core/types/tasks'
import { getTaskTimestamps } from '@api/tasks/tasks.helpers'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'
import { ActivityLogger } from '@api/activity-logs/services/activity-logger.service'
import { TaskCreatedSchema } from '@api/activity-logs/schemas/TaskCreatedSchema'
import { TaskAssignedSchema } from '@api/activity-logs/schemas/TaskAssignedSchema'
import { WorkflowStateUpdatedSchema } from '@api/activity-logs/schemas/WorkflowStateUpdatedSchema'
import { NotificationService } from '@api/notification/notification.service'
import { LabelMappingService } from '@api/label-mapping/label-mapping.service'
import { z } from 'zod'

type FilterByAssigneeId = {
  assigneeId: string
  assigneeType: AssigneeType
}

export class TasksService extends BaseService {
  /**
   * Builds filter for "get" service methods.
   * If user is an IU, return filter for all tasks associated with this workspace
   * If user is a client, return filter for just the tasks assigned to this clientId.
   * If user is a client and has a companyId, return filter for just the tasks assigned to this clientId `OR` to this companyId
   */
  private buildReadFilters(id?: string) {
    const user = this.user

    let filters = { where: { id, workspaceId: user.workspaceId, OR: undefined as unknown as FilterByAssigneeId[] } }

    if (user.clientId) {
      filters = {
        where: {
          ...filters.where,
          OR: [{ assigneeId: user.clientId as string, assigneeType: 'client' }],
        },
      }
    }
    if (user.clientId && user.companyId) {
      filters = {
        where: {
          ...filters.where,
          OR: [
            { assigneeId: user.clientId as string, assigneeType: 'client' },
            { assigneeId: user.companyId, assigneeType: 'company' },
          ],
        },
      }
    }

    return filters
  }

  async getAllTasks() {
    // Check if given user role is authorized access to this resource
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.Tasks)

    // Build query filters based on role of user. IU can access all tasks related to a workspace
    // while clients can only view the tasks assigned to them or their company
    const filters = this.buildReadFilters()

    return await this.db.task.findMany({
      ...filters,
      include: {
        workflowState: { select: { name: true } },
      },
    })
  }

  async createTask(data: CreateTaskRequest) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.Tasks)

    //generate the label
    const labelMappingService = new LabelMappingService(this.user)
    const label = z.string().parse(await labelMappingService.getLabel(data.assigneeId, data.assigneeType))

    // Create a new task associated with current workspaceId. Also inject current request user as the creator.
    const newTask = await this.db.task.create({
      data: {
        ...data,
        workspaceId: this.user.workspaceId,
        createdById: this.user.internalUserId as string,
        label: label,
        ...(await getTaskTimestamps('create', this.user, data)),
      },
      include: { workflowState: true },
    })

    if (newTask) {
      // @todo move this logic to any pub/sub service like event bus
      const activityLogger = new ActivityLogger({ taskId: newTask.id, user: this.user })
      await activityLogger.log(
        ActivityType.TASK_CREATED,
        TaskCreatedSchema.parse({
          id: newTask.id,
          workspaceId: newTask.workspaceId,
          assigneeId: newTask.assigneeId,
          assigneeType: newTask.assigneeType,
          title: newTask.title,
          body: newTask.body,
          dueData: newTask.dueDate,
        }),
      )
    }

    // If new task is assigned to someone (IU / Client), send proper notification + email to them
    if (newTask.assigneeId) {
      const notificationService = new NotificationService(this.user)
      await notificationService.create(NotificationTaskActions.Assigned, newTask)
    }

    return newTask
  }

  async getOneTask(id: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.Tasks)

    // Build query filters based on role of user. IU can access all tasks related to a workspace
    // while clients can only view the tasks assigned to them or their company
    const filters = this.buildReadFilters(id)

    const task = await this.db.task.findFirst({
      ...filters,
      include: {
        workflowState: true,
      },
    })
    if (!task) throw new APIError(httpStatus.NOT_FOUND, 'The requested task was not found')

    return task
  }

  async updateOneTask(id: string, data: UpdateTaskRequest) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Update, Resource.Tasks)

    // Query previous task
    const filters = this.buildReadFilters(id)
    const prevTask = await this.db.task.findFirst({
      ...filters,
      include: { workflowState: true },
    })
    if (!prevTask) throw new APIError(httpStatus.NOT_FOUND, 'The requested task was not found')

    let label: string = prevTask.label
    //generate new label if prevTask has no assignee but now assigned to someone
    if (!prevTask.assigneeId && data.assigneeId) {
      const labelMappingService = new LabelMappingService(this.user)
      label = z.string().parse(await labelMappingService.getLabel(data.assigneeId, data.assigneeType))
    }
    // Get the updated task
    const updatedTask = await this.db.task.update({
      where: { id },
      data: {
        ...data,
        label,
        ...(await getTaskTimestamps('update', this.user, data, prevTask)),
      },
      include: { workflowState: true },
    })

    if (updatedTask) {
      const activityLogger = new ActivityLogger({ taskId: updatedTask.id, user: this.user })

      if (updatedTask.assigneeId !== prevTask.assigneeId) {
        await activityLogger.log(
          ActivityType.TASK_ASSIGNED,
          TaskAssignedSchema.parse({
            oldAssigneeId: prevTask.assigneeId,
            newAssigneeId: updatedTask.assigneeId,
            assigneeType: updatedTask.assigneeType,
          }),
        )
      }

      if (updatedTask.workflowStateId !== prevTask?.workflowStateId) {
        const prevWorkflowState = prevTask.workflowState
        const currentWorkflowState = updatedTask.workflowState

        await activityLogger.log(
          ActivityType.WORKFLOW_STATE_UPDATED,
          WorkflowStateUpdatedSchema.parse({
            oldWorkflowState: {
              id: prevWorkflowState.id,
              type: prevWorkflowState.type,
              name: prevWorkflowState.name,
              key: prevWorkflowState.key,
              color: prevWorkflowState.color,
            },
            newWorkflowState: {
              id: currentWorkflowState.id,
              type: currentWorkflowState.type,
              name: currentWorkflowState.name,
              key: currentWorkflowState.key,
              color: currentWorkflowState.color,
            },
          }),
        )
      }
    }

    // If task goes from unassigned to assigned, or assigneeId does not match
    if (prevTask?.assigneeId != updatedTask.assigneeId && updatedTask.assigneeId) {
      const notificationService = new NotificationService(this.user)
      await notificationService.create(NotificationTaskActions.Assigned, updatedTask)
    }
    // If task was previous in another state, and is moved to a 'completed' type WorkflowState
    if (
      prevTask?.workflowState?.type !== 'completed' &&
      updatedTask?.workflowState?.type === 'completed' &&
      updatedTask.assigneeId
    ) {
      const notificationService = new NotificationService(this.user)
      await notificationService.create(NotificationTaskActions.Completed, updatedTask)
    }

    return updatedTask
  }

  async deleteOneTask(id: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Delete, Resource.Tasks)

    return await this.db.task.delete({ where: { id } })
  }

  async completeTask(id: string) {
    //Apply custom authorization here. Policy service is not used because this api is for client's Mark done function only. Only clients can use this.
    if (this.user.role !== UserRole.Client) {
      throw new APIError(httpStatus.UNAUTHORIZED, 'You are not authorized to perform this action')
    }

    // Query previous task
    const filters = this.buildReadFilters(id)
    const prevTask = await this.db.task.findFirst({
      ...filters,
      include: { workflowState: true },
    })
    if (!prevTask) throw new APIError(httpStatus.NOT_FOUND, 'The requested task was not found')

    //get Completed workflowState data
    const completedWorkFlowState = await this.db.workflowState.findFirst({
      where: {
        type: StateType.completed,
      },
    })
    const data = {
      workflowStateId: completedWorkFlowState?.id,
    }
    // Get the updated task
    const updatedTask = await this.db.task.update({
      where: { id },
      data: {
        ...data,
        ...(await getTaskTimestamps('update', this.user, data, prevTask)),
      },
    })
    const notificationService = new NotificationService(this.user)
    await notificationService.create(NotificationTaskActions.Completed, updatedTask)
    return updatedTask
  }
}
