import { BaseService } from '@api/core/services/base.service'
import User from '@api/core/models/User.model'
import { z } from 'zod'
import { ActivityType, AssigneeType, Comment } from '@prisma/client'
import { DBActivityLogArraySchema, DBActivityLogDetails, SchemaByActivityType } from '@api/activity-logs/const'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { CommentService } from '@api/comment/comment.service'
import { ClientsResponse, CompaniesResponse, InternalUsersResponse } from '@/types/common'
import { LogResponse, LogResponseSchema } from '../schemas/LogResponseSchema'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'

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
        ORDER BY "ActivityLogs"."createdAt",
          CASE
            WHEN "type" = 'TASK_CREATED' THEN 1
            WHEN "type" = 'TASK_ASSIGNED' THEN 2
            WHEN "type" = 'DUE_DATE_CHANGED' THEN 3
            ELSE 4
          END;
    `
    const parsedActivityLogs = DBActivityLogArraySchema.parse(activityLogs)

    const copilotService = new CopilotAPI(this.user.token)

    const [internalUsers, clientUsers, companies] = await Promise.all([
      copilotService.getInternalUsers(),
      copilotService.getClients(),
      copilotService.getCompanies(),
    ])

    const copilotUsers = parsedActivityLogs
      .map((activityLog) => {
        if (activityLog.userRole === AssigneeType.internalUser) {
          return internalUsers.data.find((iu) => iu.id === activityLog.userId)
        }
        if (activityLog.userRole === AssigneeType.client) {
          return clientUsers.data?.find((client) => client.id === activityLog.userId)
        }
      })
      .filter((user): user is NonNullable<typeof user> => user !== undefined)

    const commentIds = parsedActivityLogs
      .filter((activityLog) => activityLog.type === ActivityType.COMMENT_ADDED)
      .map((activityLog) => activityLog.details.id)
      .filter((commentId: unknown): commentId is string => commentId !== null)

    const commentService = new CommentService(this.user)
    const comments = await commentService.getCommentsByIds(commentIds)
    const allReplies = await commentService.getReplies(commentIds)

    const logResponseData = parsedActivityLogs.map((activityLog) => {
      const initiator = copilotUsers.find((iu) => iu.id === activityLog.userId) || null
      return {
        ...activityLog,
        details: this.formatActivityLogDetails(
          activityLog.type,
          activityLog.userRole,
          activityLog.details,
          comments,
          allReplies,
          internalUsers,
          clientUsers,
          companies,
        ),
        createdAt: activityLog.createdAt.toISOString(),
        initiator,
      }
    })

    const validLogResponseData: LogResponse[] = []
    logResponseData.map((rd) => {
      const parseResult = LogResponseSchema.safeParse(rd)
      if (parseResult.success) {
        validLogResponseData.push(parseResult.data)
      } else {
        console.warn('Invalid log entry skipped:', parseResult.error)
      }
    })
    return validLogResponseData
  }

  formatActivityLogDetails<ActivityLog extends keyof typeof SchemaByActivityType>(
    activityType: ActivityLog,
    userRole: AssigneeType,
    payload: DBActivityLogDetails,
    comments: Comment[],
    allReplies: Comment[],
    internalUsers: InternalUsersResponse,
    clientUsers: ClientsResponse,
    companies: CompaniesResponse,
  ) {
    switch (activityType) {
      case ActivityType.COMMENT_ADDED:
        const comment = comments.find((comment) => comment.id === payload.id)
        if (!comment) {
          throw new APIError(httpStatus.NOT_FOUND, `Error while finding comment with id ${payload.id}`)
        }

        let replies = allReplies.filter((reply) => reply.parentId === comment.id)

        const copilotUsers = replies
          .map((reply) => {
            if (userRole === AssigneeType.internalUser) {
              return internalUsers.data.find((iu) => iu.id === reply.initiatorId)
            }
            if (userRole === AssigneeType.client) {
              return clientUsers.data?.find((client) => client.id === reply.initiatorId)
            }
          })
          .filter((user): user is NonNullable<typeof user> => user !== undefined)

        replies = replies.map((comment) => ({
          ...comment,
          initiator: copilotUsers.find((iu) => iu.id === comment.initiatorId) || null,
        }))

        return {
          ...payload,
          content: comment.content,
          replies,
        }

      default:
        return payload
    }
  }
}
