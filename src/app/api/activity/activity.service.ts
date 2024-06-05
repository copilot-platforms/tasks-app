import { ActivityType, AssigneeType, LogType, Task } from '@prisma/client'
import { BaseService } from '@/app/api/core/services/base.service'
import { CopilotAPI } from '@/utils/CopilotAPI'
import User from '@/app/api/core/models/User.model'
import { ClientResponse, CompanyResponse, InternalUsers, MeResponse } from '@/types/common'
import { UpdateTaskRequest } from '@/types/dto/tasks.dto'
import WorkflowStatesService from '@/app/api/workflow-states/workflowStates.service'
import { PoliciesService } from '@/app/api/core/services/policies.service'
import { UserAction } from '@/app/api/core/types/user'
import { Resource } from '@/app/api/core/types/api'
import { z } from 'zod'
import { CommentResponseSchema } from '@/types/dto/comment.dto'
import { ActivityLogResponseSchema } from '@/types/dto/activity.dto'
import { CommentService } from '../comment/comment.service'

export class ActivityLogger extends BaseService {
  public taskId: string

  constructor({ taskId, user }: { taskId: string; user: User }) {
    super(user)
    this.taskId = taskId
  }

  async createTaskLog() {
    const userInfo = await this.getUserInfo(this.user.token)

    await this.db.log.create({
      data: {
        taskId: this.taskId,
        workspaceId: this.user.workspaceId,
        logType: LogType.ACTIVITY,
        activityLog: {
          create: {
            taskId: this.taskId,
            workspaceId: this.user.workspaceId,
            activityType: ActivityType.CREATE_TASK,
            details: {
              initiator: `${userInfo?.givenName || ''} ${userInfo?.familyName || ''}`.trim(),
              initiatorId: this.user.internalUserId as string,
              type: ActivityType.CREATE_TASK,
            },
          },
        },
      },
    })
  }

  async createAssignLog(payload: UpdateTaskRequest) {
    if (payload.assigneeId) {
      const userInfo = await this.getUserInfo(this.user.token)

      const clientInfo: unknown = await this.getUserInfoById(payload, this.user.token)

      let assignedTo =
        payload.assigneeType === AssigneeType.company
          ? (clientInfo as CompanyResponse).name
          : `${(clientInfo as InternalUsers)?.givenName} ${(clientInfo as InternalUsers)?.familyName}`

      await this.db.log.create({
        data: {
          taskId: this.taskId,
          workspaceId: this.user.workspaceId,
          logType: LogType.ACTIVITY,
          activityLog: {
            create: {
              taskId: this.taskId,
              workspaceId: this.user.workspaceId,
              activityType: ActivityType.ASSIGN_TASK,
              details: {
                initiator: `${userInfo?.givenName || ''} ${userInfo?.familyName || ''}`.trim(),
                initiatorId: this.user.internalUserId as string,
                assignedTo: assignedTo,
                assignedToId: payload.assigneeId,
                type: ActivityType.ASSIGN_TASK,
              },
            },
          },
        },
      })
    }
  }

  async createWorkflowStateLog(payload: UpdateTaskRequest, prevTaskPayload: Task | null) {
    if (payload.workflowStateId && prevTaskPayload?.workflowStateId) {
      const userInfo = await this.getUserInfo(this.user.token)

      const workflowStateService = new WorkflowStatesService(this.user)
      const prevWorkflowState = await workflowStateService.getOneWorkflowState(prevTaskPayload.workflowStateId)
      const currentWorkflowState = await workflowStateService.getOneWorkflowState(payload.workflowStateId)

      await this.db.log.create({
        data: {
          taskId: this.taskId,
          workspaceId: this.user.workspaceId,
          logType: LogType.ACTIVITY,
          activityLog: {
            create: {
              taskId: this.taskId,
              workspaceId: this.user.workspaceId,
              activityType: ActivityType.WORKFLOWSTATE_UPDATE,
              details: {
                initiator: `${userInfo?.givenName || ''} ${userInfo?.familyName || ''}`.trim(),
                initiatorId: this.user.internalUserId as string,
                prevWorkflowState,
                currentWorkflowState,
                type: ActivityType.WORKFLOWSTATE_UPDATE,
              },
            },
          },
        },
      })
    }
  }

  async initiateLogging(payload: UpdateTaskRequest, prevTask: Task) {
    if (payload.assigneeId !== prevTask.assigneeId) {
      await this.createAssignLog(payload)
    }

    if (payload.workflowStateId !== prevTask.workflowStateId) {
      await this.createWorkflowStateLog(payload, prevTask)
    }
  }

  async getUserInfo(token: string) {
    const copilotUtils = new CopilotAPI(token)
    try {
      const userInfo = await copilotUtils.me()
      return userInfo
    } catch (e: unknown) {
      console.error('Something went wrong!')
    }
  }

  async getUserInfoById(payload: UpdateTaskRequest, token: string) {
    const copilotUtils = new CopilotAPI(token)
    const id = payload.assigneeId as string
    try {
      if (payload.assigneeType === AssigneeType.internalUser) {
        const userInfo = await copilotUtils.getInternalUser(id)
        return userInfo as InternalUsers
      }
      if (payload.assigneeType === AssigneeType.company) {
        const userInfo = await copilotUtils.getCompany(id)
        return userInfo as CompanyResponse
      }
      if (payload.assigneeType === AssigneeType.client) {
        const userInfo = await copilotUtils.getClient(id)
        return userInfo as ClientResponse
      }
    } catch (e: unknown) {
      console.error('Something went wrong!')
    }
  }

  async getActivityLogs() {
    const activityLogs = await this.db.activityLog.findMany({
      where: {
        workspaceId: this.user.workspaceId,
        taskId: this.taskId,
      },
    })
    return z.array(ActivityLogResponseSchema).parse(activityLogs)
  }

  async getActivityWithComment() {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.Comment)

    // const commentService = new CommentService(this.user)
    // const comments = await commentService.getAllComments(this.taskId)
    // const activityLogs = await this.getActivityLogs()

    // // Combine comments and activity logs
    // const combinedResults = [...comments, ...activityLogs]

    // // Sort combined results by createdAt field in descending order
    // combinedResults.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    const logs = await this.db.log.findMany({
      where: {
        workspaceId: this.user.workspaceId,
        OR: [
          {
            activityLog: {
              taskId: this.taskId,
            },
          },
          {
            comment: {
              taskId: this.taskId,
              parentId: null, // Filter for top-level comments
            },
          },
        ],
      },
      include: {
        activityLog: true, // Include associated activity logs
        comment: {
          include: {
            attachments: true, // Include attachments for comments
            children: {
              where: {
                deletedAt: null, // Only include non-deleted child comments
              },
              include: {
                attachments: true, // Include attachments for child comments
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Order logs by creation date
      },
    })

    return logs
  }
}
