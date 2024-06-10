import { BaseService } from '@api/core/services/base.service'
import User from '@api/core/models/User.model'
import { z } from 'zod'
import { ActivityType } from '@prisma/client'
import { DBActivityLogArraySchema, DBActivityLogDetails, SchemaByActivityType } from '@api/activity-logs/const'
import { CommentAddedTransformer } from '@api/activity-logs/transformers/comment-added.transformer'
import { CommentAddedSchema } from '@api/activity-logs/schemas/CommentAddedSchema'

export class ActivityLogService extends BaseService {
  constructor(user: User) {
    super(user)
  }

  async get(taskId: string) {
    const activityLogs = await this.db.$queryRaw`
        select "ActivityLogs".*
        from "ActivityLogs"
                 left join public."Comments" C
                           on "ActivityLogs"."taskId" = C."taskId" AND ("ActivityLogs".details::JSON ->> 'id')::text = C.id::text
        where "ActivityLogs"."taskId" = ${z.string().uuid().parse(taskId)}::uuid
          AND (
            "ActivityLogs".type <> ${ActivityType.COMMENT_ADDED}::"ActivityType"
            OR
            (
                "ActivityLogs".type = ${ActivityType.COMMENT_ADDED}::"ActivityType" 
                AND C."deletedAt" IS NULL AND C."parentId" IS NULL
            )
          )
        ORDER BY "ActivityLogs"."createdAt";
    `
    const parsedActivityLogs = DBActivityLogArraySchema.parse(activityLogs)

    // @todo fetch all users - internal as well as client and pass them to each transformer for name, profile picture etc.

    // @todo fetch all the comments BASED on the and pass them to the comment transformer to get the content of the latest comment
    const commentIds = parsedActivityLogs
      .filter((activityLog) => activityLog.type === ActivityType.COMMENT_ADDED)
      .map((activityLog) => activityLog.details.id)
    // Now fetch all the comments based on the commentIds

    return parsedActivityLogs.map((activityLog) => {
      return {
        ...activityLog,
        details: this.formatActivityLogDetails(activityLog.type, activityLog.details),
        createdAt: activityLog.createdAt.toISOString(),
      }
    })
  }

  formatActivityLogDetails<ActivityLog extends keyof typeof SchemaByActivityType>(
    activityType: ActivityLog,
    payload: DBActivityLogDetails,
  ) {
    switch (activityType) {
      case ActivityType.COMMENT_ADDED:
        return new CommentAddedTransformer().transform(CommentAddedSchema.parse(payload))
      default:
        return payload
    }
  }
}
