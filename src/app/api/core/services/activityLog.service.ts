import { ActivityType } from '@prisma/client'
import { BaseService } from './base.service'
import { CopilotAPI } from '@/utils/CopilotAPI'
import User from '../models/User.model'
import { MeResponse } from '@/types/common'
import { TaskResponse, TaskResponseSchema, UpdateTaskRequest, UpdateTaskRequestSchema } from '@/types/dto/tasks.dto'

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

      const clientInfo = await this.getUserInfoById(payload.assigneeId, this.user.token)

      await this.db.activityLog.create({
        data: {
          taskId: this.taskId,
          workspaceId: this.user.workspaceId,
          activityType: ActivityType.ASSIGN_TASK,
          assigneeTracker: {
            create: {
              initiator: this.userInfo?.givenName || '' + ' ' + this.userInfo?.familyName || '',
              initiatorId: this.user.internalUserId as string,
              assignedTo: clientInfo.givenName + ' ' + clientInfo.familyName,
              assignedToId: payload.assigneeId,
            },
          },
        },
      })
    }
  }

  async createWorkflowStateLog(payload: UpdateTaskRequest, prevTaskPayload: any) {
    if (payload.workflowStateId && prevTaskPayload.workflowStateId) {
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

  async initiateLogging(payload: UpdateTaskRequest) {
    const currentTask = await this.db.task.findUnique({
      where: {
        id: this.taskId,
      },
    })
    if (payload.assigneeId !== currentTask?.assigneeId) {
      await this.createAssignLog(payload)
    }

    if (payload.workflowStateId !== currentTask?.workflowStateId) {
      await this.createWorkflowStateLog(payload, currentTask)
    }
  }

  async getUserInfo(token: string) {
    const copilotUtils = new CopilotAPI(token)
    const userInfo = await copilotUtils.me()
    this.userInfo = userInfo
  }

  async getUserInfoById(id: string, token: string) {
    const copilotUtils = new CopilotAPI(token)
    const userInfo = await copilotUtils.getInternalUser(id)
    return userInfo
  }
}
