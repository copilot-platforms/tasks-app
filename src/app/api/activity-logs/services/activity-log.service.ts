import { MAX_FETCH_ASSIGNEE_COUNT } from '@/constants/users'
import { ClientsResponse, CompaniesResponse, CopilotListArgs, InternalUsers, InternalUsersResponse } from '@/types/common'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { signMediaForComments } from '@/utils/signedUrlReplacer'
import {
  DBActivityLogArray,
  DBActivityLogArraySchema,
  DBActivityLogDetails,
  SchemaByActivityType,
} from '@api/activity-logs/const'
import { LogResponse, LogResponseSchema } from '@api/activity-logs/schemas/LogResponseSchema'
import { CommentService } from '@api/comment/comment.service'
import APIError from '@api/core/exceptions/api'
import User from '@api/core/models/User.model'
import { BaseService } from '@api/core/services/base.service'
import { ActivityType, AssigneeType, Comment, CommentInitiator } from '@prisma/client'
import httpStatus from 'http-status'
import { z } from 'zod'

export class ActivityLogService extends BaseService {
  constructor(user: User) {
    super(user)
  }

  async get(
    taskId: string,
    opts?: {
      // Parent comment IDs in expandComments array are not limited to fetching just the latest 3 replies,
      // instead the filter "expands" to fetch all replies in the same ordering
      expandComments?: string[]
    },
  ) {
    const activityLogs = await this.db.$queryRaw`
        select "ActivityLogs".*
        from "ActivityLogs"
                 left join public."Comments" C
                           on "ActivityLogs"."taskId" = C."taskId" AND ("ActivityLogs".details::JSON ->> 'id')::text = C.id::text
        where "ActivityLogs"."taskId" = ${z.string().uuid().parse(taskId)}::uuid
          AND "ActivityLogs"."deletedAt" IS NULL
          AND (
            "ActivityLogs".type <> ${ActivityType.COMMENT_ADDED}::"ActivityType"
            OR
            (
                "ActivityLogs".type = ${ActivityType.COMMENT_ADDED}::"ActivityType"
                AND C."parentId" IS NULL
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

    const userOpts: CopilotListArgs = { limit: MAX_FETCH_ASSIGNEE_COUNT }
    const [internalUsers, clientUsers, companies] = await Promise.all([
      copilotService.getInternalUsers(userOpts),
      copilotService.getClients(userOpts),
      copilotService.getCompanies(userOpts),
    ])

    let filteredActivityLogs = parsedActivityLogs

    if (this.user.role == AssigneeType.internalUser) {
      const currentInternalUser = internalUsers.data.find((iu) => iu.id === this.user.internalUserId)
      if (currentInternalUser?.isClientAccessLimited) {
        filteredActivityLogs = this.filterActivityLogsForLimitedAccess(
          parsedActivityLogs,
          clientUsers,
          companies,
          currentInternalUser,
        )
      }
    }

    const commentIds = filteredActivityLogs
      .filter((activityLog) => activityLog.type === ActivityType.COMMENT_ADDED)
      .map((activityLog) => activityLog.details.id)
      .filter((commentId: unknown): commentId is string => commentId !== null)

    const commentService = new CommentService(this.user)
    const comments = await commentService.getCommentsByIds(commentIds)
    const signedComments = await signMediaForComments(comments)

    const [allReplies, replyCounts, initiators] = await Promise.all([
      commentService.getReplies(commentIds, opts?.expandComments),
      commentService.getReplyCounts(commentIds),
      commentService.getThreadInitiators(commentIds, internalUsers, clientUsers),
    ])
    const signedReplies = await signMediaForComments(allReplies)

    const logResponseData = filteredActivityLogs.map((activityLog) => {
      return {
        ...activityLog,
        details: this.formatActivityLogDetails(
          activityLog.type,
          activityLog.details,
          signedComments,
          signedReplies,
          replyCounts,
          initiators,
        ),
        createdAt: activityLog.createdAt.toISOString(),
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
    payload: DBActivityLogDetails,
    comments: Comment[],
    allReplies: Comment[],
    replyCounts: Record<string, number>,
    initiators: Record<string, Array<any>>,
  ) {
    switch (activityType) {
      case ActivityType.COMMENT_ADDED:
        const comment = comments.find((comment) => comment.id === payload.id)
        if (!comment) {
          throw new APIError(httpStatus.NOT_FOUND, `Error while finding comment with id ${payload.id}`)
        }

        let replies = allReplies.filter((reply) => reply.parentId === comment.id)

        replies = replies
          .map((comment) => ({
            ...comment,
          }))
          .reverse()

        return {
          ...payload,
          content: comment.deletedAt ? '' : comment.content,
          replies,
          replyCount: replyCounts[comment.id] || 0,
          firstInitiators: initiators?.[comment.id]?.slice(0, 3),
          updatedAt: comment.updatedAt,
          createdAt: comment.createdAt,
          deletedAt: comment.deletedAt,
        }

      default:
        return payload
    }
  }

  private filterActivityLogsForLimitedAccess(
    parsedActivityLogs: DBActivityLogArray,
    clientUsers: ClientsResponse,
    companies: CompaniesResponse,
    currentInternalUser: InternalUsers,
  ): DBActivityLogArray {
    const previousAssigneeIds = parsedActivityLogs
      .filter(
        (log) =>
          log.type === 'TASK_ASSIGNED' &&
          (clientUsers.data?.some((client) => client.id == log.details.oldValue) ||
            companies.data?.some((company) => company.id == log.details.oldValue)),
      )
      .map((log) => log.details.oldValue)
      .reverse()

    const previousUnaccessibleAssignee = previousAssigneeIds.find((id) => {
      let companyId

      const unaccessibleClient = clientUsers.data?.find((client) => client.id === id)
      if (unaccessibleClient) {
        companyId = unaccessibleClient.companyId
      } else {
        const unaccessibleCompany = companies.data?.find((company) => company.id === id)
        companyId = unaccessibleCompany?.id
      }
      if (companyId) {
        return !currentInternalUser.companyAccessList?.includes(z.string().parse(companyId))
      }
      return false
    })

    const latestTaskAssignedIndex = parsedActivityLogs.findLastIndex(
      (log) => log.type === 'TASK_ASSIGNED' && log.details.oldValue === previousUnaccessibleAssignee,
    )

    if (latestTaskAssignedIndex) {
      return parsedActivityLogs.filter((log, index) => log.type === 'TASK_CREATED' || index >= latestTaskAssignedIndex)
    }

    return parsedActivityLogs
  }
}
