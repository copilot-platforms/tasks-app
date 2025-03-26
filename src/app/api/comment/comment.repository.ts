import { BaseRepository } from '@api/core/repository/base.repository'
import { Comment, CommentInitiator, Prisma } from '@prisma/client'

type CommentInitiatorResult = { parentId: string; initiatorId: string; initiatorType: CommentInitiator }

export class CommentRepository extends BaseRepository {
  async getFirstCommentInitiators(
    parentCommentIds: string[],
    limitPerParent: number = 3,
  ): Promise<CommentInitiatorResult[]> {
    const results = await this.db.$queryRaw<CommentInitiatorResult[]>`
      WITH ranked_comments AS (
        SELECT "parentId", "initiatorId", "initiatorType",
          -- Use DENSE_RANK to ensure ranking is based on earliest time based on createdAt
          DENSE_RANK() OVER (
            PARTITION BY "parentId" ORDER BY MIN("createdAt") ASC
          ) AS rank_num
        FROM "Comments"
        WHERE "parentId"::text IN (${Prisma.join(parentCommentIds)})
          AND "deletedAt" IS NULL
        -- Ensures one initiatorId appears only ONCE per parentId (hopefully)
        GROUP BY "parentId", "initiatorId", "initiatorType"
      )
      SELECT "parentId", "initiatorId", "initiatorType"
      FROM ranked_comments
      WHERE rank_num <= ${limitPerParent};
    `
    return results
  }

  async getAllRepliesForParents(parentCommentIds: string[]): Promise<Comment[]> {
    return await this.db.comment.findMany({
      where: {
        parentId: { in: parentCommentIds },
        workspaceId: this.user.workspaceId,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getLimitedRepliesForParents(parentCommentIds: string[], limitPerParent: number = 3): Promise<Comment[]> {
    // IMPORTANT: If you change the schema of Comments table be sure to add them here too.
    return await this.db.$queryRaw<Comment[]>`
      WITH replies AS (
        SELECT *,
          ROW_NUMBER() OVER (PARTITION BY "parentId" ORDER BY "createdAt" DESC) AS rank
        FROM "Comments"
        WHERE "parentId"::text IN (${Prisma.join(parentCommentIds)})
          AND "deletedAt" IS NULL
      )

      SELECT id, content, "initiatorId", "initiatorType", "parentId", "taskId", "workspaceId", "createdAt", "updatedAt", "deletedAt"
      FROM replies
      WHERE rank <= ${limitPerParent};
    `
  }
}
