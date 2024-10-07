import { TaskCreatedDetails, TaskCreatedDetailsSchema, ValidActivityDetails } from '@/types/activityLogs'
import User from '@api/core/models/User.model'
import { BaseService } from '@api/core/services/base.service'
import { ActivityLog, ActivityType, AssigneeType, Task } from '@prisma/client'
import { z } from 'zod'

/**
 * Service to quickly add an activity log to a task for a supported ActivityType
 */
export class ActivityLogsService extends BaseService {
  constructor(
    user: User,
    private task: Task,
  ) {
    super(user)
  }

  private detailsSchema: Partial<Record<ActivityType, z.ZodObject<any>>> = {
    [ActivityType.TASK_CREATED]: TaskCreatedDetailsSchema,
  }

  private async insertActivityLog(activityType: ActivityType, details: ValidActivityDetails) {
    await this.db.activityLog.create({
      data: {
        taskId: this.task.id,
        workspaceId: this.task.workspaceId,
        type: activityType,
        details,
        userId: z.string().parse(this.user.internalUserId || this.user.clientId),
        userType: this.user.role,
      },
    })
  }

  async log(activityType: ActivityType, details: unknown): Promise<void | ActivityLog> {
    const schema = this.detailsSchema[activityType]
    if (!schema) {
      console.error('Unsupported activity log type')
      return
    }

    const parsedDetails = schema.parse(details)
    if (parsedDetails.error) {
      // Log an error instead of crashing the endpoint
      console.error(
        'An error occured while logging task',
        this.task,
        'with activity details',
        details,
        '\nError:',
        parsedDetails.error,
      )
      return
    }

    return await this.insertActivityLog(activityType, parsedDetails.data)
  }

  async getAllLogs() {
    return this.db.activityLog.findMany({
      where: {
        workspaceId: this.user.workspaceId,
        taskId: this.task.id,
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
