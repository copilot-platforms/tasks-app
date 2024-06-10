import { BaseService } from '@api/core/services/base.service'
import User from '@api/core/models/User.model'
import { z } from 'zod'
import { ActivityType, Comment } from '@prisma/client'
import { DBActivityLogArraySchema, DBActivityLogDetails, SchemaByActivityType } from '@api/activity-logs/const'

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

    const commentIds = parsedActivityLogs
      .filter((activityLog) => activityLog.type === ActivityType.COMMENT_ADDED)
      .map((activityLog) => activityLog.details.id)
      .filter((commentId: unknown): commentId is string => commentId !== null)

    // @todo move the db call to comment service
    const comments = await this.db.comment.findMany({
      where: {
        id: {
          in: commentIds,
        },
      },
    })

    return parsedActivityLogs.map((activityLog) => {
      return {
        ...activityLog,
        details: this.formatActivityLogDetails(activityLog.type, activityLog.details, comments),
        createdAt: activityLog.createdAt.toISOString(),
        initiator: {
          // @todo filter users based on the userId from the activity log and return id, name and profile picture
        },
      }
    })
  }

  formatActivityLogDetails<ActivityLog extends keyof typeof SchemaByActivityType>(
    activityType: ActivityLog,
    payload: DBActivityLogDetails,
    comments: Comment[],
  ) {
    switch (activityType) {
      case ActivityType.COMMENT_ADDED:
        const comment = comments.find((comment) => comment.id === payload.id)
        if (!comment) {
          throw new Error(`Error while finding comment with id ${payload.id}`)
        }
        return {
          ...payload,
          content: comment.content,
        }
      default:
        return payload
    }
  }
}
