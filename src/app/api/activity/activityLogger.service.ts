import { ActivityType, AssigneeType, Task } from '@prisma/client'
import { BaseService } from '@/app/api/core/services/base.service'
import { CopilotAPI } from '@/utils/CopilotAPI'
import User from '../core/models/User.model'
import { ClientResponse, CompanyResponse, InternalUsers, MeResponse } from '@/types/common'
import { UpdateTaskRequest } from '@/types/dto/tasks.dto'

export class ActivityLogger extends BaseService {
  public taskId: string
  protected userInfo: MeResponse | null

  constructor({ taskId, user }: { taskId: string; user: User }) {
    super(user)
    this.taskId = taskId
    this.userInfo = null
  }

  async createTaskLog() {
    await this.getUserInfo(this.user.token)

    await this.db.activityLog.create({
      data: {
        taskId: this.taskId,
        workspaceId: this.user.workspaceId,
        activityType: ActivityType.CREATE_TASK,
        createTaskTracker: {
          create: {
            createdBy: this.userInfo?.givenName || '' + ' ' + this.userInfo?.familyName || '',
            createdById: this.user.internalUserId as string,
          },
        },
      },
    })
  }

  async createAssignLog(payload: UpdateTaskRequest) {
    if (payload.assigneeId) {
      await this.getUserInfo(this.user.token)

      const clientInfo = await this.getUserInfoById(payload, this.user.token)

      let assignedTo = ''

      if (isCompanyResponse(clientInfo)) {
        assignedTo = clientInfo.name
      } else if (isInternalUsers(clientInfo) || isClientResponse(clientInfo)) {
        assignedTo = `${clientInfo.givenName} ${clientInfo.familyName}`
      }

      await this.db.activityLog.create({
        data: {
          taskId: this.taskId,
          workspaceId: this.user.workspaceId,
          activityType: ActivityType.ASSIGN_TASK,
          assigneeTracker: {
            create: {
              initiator: this.userInfo?.givenName + ' ' + this.userInfo?.familyName,
              initiatorId: this.user.internalUserId as string,
              assignedTo: assignedTo,
              assignedToId: payload.assigneeId,
            },
          },
        },
      })
    }
  }

  async createWorkflowStateLog(payload: UpdateTaskRequest, prevTaskPayload: Task | null) {
    if (payload.workflowStateId && prevTaskPayload?.workflowStateId) {
      await this.getUserInfo(this.user.token)

      await this.db.activityLog.create({
        data: {
          taskId: this.taskId,
          workspaceId: this.user.workspaceId,
          activityType: ActivityType.WORKFLOWSTATE_UPDATE,
          workflowStateTracker: {
            create: {
              initiator: this.userInfo?.givenName || ' ' + this.userInfo?.familyName || '',
              initiatorId: this.user.internalUserId as string,
              prevWorkflowStateId: prevTaskPayload.workflowStateId,
              currentWorkflowStateId: payload.workflowStateId,
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
      this.userInfo = userInfo
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
}

// Type guard functions
function isInternalUsers(user: any): user is InternalUsers {
  return (user as InternalUsers).givenName !== undefined
}

function isCompanyResponse(user: any): user is CompanyResponse {
  return (user as CompanyResponse).name !== undefined
}

function isClientResponse(user: any): user is ClientResponse {
  return (user as ClientResponse).givenName !== undefined && (user as ClientResponse).familyName !== undefined
}
