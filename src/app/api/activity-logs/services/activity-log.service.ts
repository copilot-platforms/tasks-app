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
    const copilot = new CopilotAPI(this.user.token)

    let filteredActivityLogs = parsedActivityLogs

    if (this.user.role == AssigneeType.internalUser && this.user.internalUserId) {
      const currentInternalUser = await copilot.getInternalUser(this.user.internalUserId)
      if (currentInternalUser?.isClientAccessLimited) {
        filteredActivityLogs = await this.filterActivityLogsForLimitedAccess(
          parsedActivityLogs,
          copilot,
          currentInternalUser,
        )
      }
    }
    if (this.user.clientId) {
      filteredActivityLogs = await this.filterActivityLogsForClient(taskId, parsedActivityLogs, copilot)
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
      commentService.getThreadInitiators(commentIds),
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

        const replies = allReplies.filter((reply) => reply.parentId === comment.id).reverse()

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

  private async filterActivityLogsForClient(taskId: string, parsedActivityLogs: DBActivityLogArray, copilot: CopilotAPI) {
    const task = await this.db.task.findFirstOrThrow({
      where: { id: taskId, workspaceId: this.user.workspaceId },
    })

    // If task is a client task, then we only show activity logs authored by
    // IUs, or self client
    if (task.clientId) {
      return parsedActivityLogs.filter(
        (log) => log.userRole === AssigneeType.internalUser || log.userId === this.user.clientId,
      )
    }
    // If task is a company task, then we only show activity logs authored by IU, or other clients
    // within the same company
    if (!task.clientId && task.companyId) {
      const companyClients = (await copilot.getClients({ companyId: task.companyId }))?.data || []
      return parsedActivityLogs.filter((log) => {
        console.log(
          log,
          log.userRole === AssigneeType.internalUser,
          log.userId === this.user.clientId,
          companyClients.some((client) => client.id === log.userId),
        )
        return (
          log.userRole === AssigneeType.internalUser ||
          log.userId === this.user.clientId ||
          companyClients.some((client) => client.id === log.userId)
        )
      })
    }

    return parsedActivityLogs
  }

  private async filterActivityLogsForLimitedAccess(
    parsedActivityLogs: DBActivityLogArray,
    copilotService: CopilotAPI,
    currentInternalUser: InternalUsers,
  ): Promise<DBActivityLogArray> {
    const userOpts: CopilotListArgs = { limit: MAX_FETCH_ASSIGNEE_COUNT }
    const [clientUsers, companies] = await Promise.all([
      copilotService.getClients(userOpts),
      copilotService.getCompanies(userOpts),
    ])

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
