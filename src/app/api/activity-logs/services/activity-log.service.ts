import { BaseService } from '@api/core/services/base.service'
import User from '@api/core/models/User.model'
import { z } from 'zod'
import { ActivityType, AssigneeType, Comment } from '@prisma/client'
import { DBActivityLogArraySchema, DBActivityLogDetails, SchemaByActivityType } from '@api/activity-logs/const'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { InternalUsers } from '@/types/common'
import { CommentService } from '../../comment/comment.service'

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

    const copilotService = new CopilotAPI(this.user.token)

    const promises_getInternalUser = parsedActivityLogs.map(async (activityLog) => {
      return copilotService.getInternalUser(activityLog.userId)
    })

    const internalUsers = await Promise.all(promises_getInternalUser)

    const commentIds = parsedActivityLogs
      .filter((activityLog) => activityLog.type === ActivityType.COMMENT_ADDED)
      .map((activityLog) => activityLog.details.id)
      .filter((commentId: unknown): commentId is string => commentId !== null)

    const commentService = new CommentService(this.user)
    const comments = await commentService.getCommentsByIds(commentIds)

    return await Promise.all(
      parsedActivityLogs.map(async (activityLog) => {
        return {
          ...activityLog,
          details: await this.formatActivityLogDetails(activityLog.type, activityLog.details, comments),
          createdAt: activityLog.createdAt.toISOString(),
          initiator: {
            ...internalUsers.find((iu) => iu.id === activityLog.userId),
          },
        }
      }),
    )
  }

  async formatActivityLogDetails<ActivityLog extends keyof typeof SchemaByActivityType>(
    activityType: ActivityLog,
    payload: DBActivityLogDetails,
    comments: Comment[],
  ) {
    const copilotService = new CopilotAPI(this.user.token)
    switch (activityType) {
      case ActivityType.COMMENT_ADDED:
        const comment = comments.find((comment) => comment.id === payload.id)
        if (!comment) {
          throw new Error(`Error while finding comment with id ${payload.id}`)
        }

        const commentService = new CommentService(this.user)
        let children = await commentService.getChildrenCommentByCommentId(comment.id)

        const promises_getInternalUser = children.map(async (comment) => {
          return copilotService.getInternalUser(comment.initiatorId)
        })

        const internalUsers = await Promise.all(promises_getInternalUser)

        children = children.map((comment) => ({
          ...comment,
          initiator: internalUsers.find((iu) => iu.id === comment.initiatorId),
        }))

        return {
          ...payload,
          content: comment.content,
          children,
        }

      case ActivityType.TASK_ASSIGNED:
        const newAssigneeId = payload.newAssigneeId as string
        const newAssigneeDetails = await (async () => {
          switch (payload.assigneeType) {
            case AssigneeType.internalUser:
              return await copilotService.getInternalUser(newAssigneeId)
            case AssigneeType.client:
              return await copilotService.getClient(newAssigneeId)
            case AssigneeType.company:
              return await copilotService.getCompany(newAssigneeId)
            default:
              return null
          }
        })()
        return {
          ...payload,
          newAssigneeDetails,
        }

      default:
        return payload
    }
  }
}
