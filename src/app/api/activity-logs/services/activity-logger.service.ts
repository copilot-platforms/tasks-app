import { CopilotAPI } from '@/utils/CopilotAPI'
import { SchemaByActivityType } from '@api/activity-logs/const'
import User from '@api/core/models/User.model'
import { BaseService } from '@api/core/services/base.service'
import { TasksService } from '@api/tasks/tasks.service'
import { z } from 'zod'

export class ActivityLogger extends BaseService {
  public taskId: string

  constructor({ taskId, user }: { taskId: string; user: User }) {
    super(user)
    this.taskId = taskId
  }

  async getUserInfo(token: string) {
    const copilotUtils = new CopilotAPI(token)
    try {
      return await copilotUtils.me()
    } catch (e: unknown) {
      console.error('Error while fetching user', e)
    }
  }

  async log<ActivityLog extends keyof typeof SchemaByActivityType = keyof typeof SchemaByActivityType>(
    activityType: ActivityLog,
    payload: NonNullable<z.input<(typeof SchemaByActivityType)[ActivityLog]>>,
  ) {
    const userInfo = await this.getUserInfo(this.user.token)

    const createActivityLog = this.db.activityLog.create({
      data: {
        taskId: this.taskId,
        workspaceId: this.user.workspaceId,
        type: activityType,
        userId: z.string().parse(userInfo?.id),
        userRole: this.user.role,
        details: payload,
      },
    })
    const tasksService = new TasksService(this.user)
    const updateLastActivityLogTimestamp = tasksService.setNewLastActivityLogUpdated(this.taskId)

    await Promise.all([createActivityLog, updateLastActivityLogTimestamp])
  }
}
