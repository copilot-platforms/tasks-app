import { CreateComment, UpdateComment } from '@/types/dto/comment.dto'
import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { UserAction } from '@api/core/types/user'
import { Resource } from '@api/core/types/api'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { ActivityLogger } from '@api/activity-logs/services/activity-logger.service'
import { ActivityType } from '@prisma/client'
import { CommentAddedSchema } from '@api/activity-logs/schemas/CommentAddedSchema'

export class CommentService extends BaseService {
  async create(data: CreateComment) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.Comment)

    const copilotUtils = new CopilotAPI(this.user.token)
    const userInfo = await copilotUtils.me()

    if (!userInfo) {
      throw new Error(`User not found for token ${this.user.token}`)
    }

    const comment = await this.db.comment.create({
      data: {
        content: data.content,
        taskId: data.taskId,
        parentId: data.parentId,
        workspaceId: this.user.workspaceId,
        initiatorId: userInfo.id,
      },
    })

    const activityLogger = new ActivityLogger({ taskId: data.taskId, user: this.user })
    await activityLogger.log(
      ActivityType.COMMENT_ADDED,
      CommentAddedSchema.parse({
        id: comment.id,
        content: comment.content,
        initiatorId: userInfo.id,
      }),
    )

    return comment
  }

  async delete(id: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Delete, Resource.Comment)

    return this.db.comment.delete({ where: { id } })
  }

  async update(id: string, data: UpdateComment) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Update, Resource.Comment)

    return this.db.comment.update({
      where: { id },
      data: {
        ...data,
      },
    })
  }
}
