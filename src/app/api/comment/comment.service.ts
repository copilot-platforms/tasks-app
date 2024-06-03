import { CreateComment, UpdateComment } from '@/types/dto/comment.dto'
import { BaseService } from '../core/services/base.service'
import { PoliciesService } from '../core/services/policies.service'
import { UserAction } from '../core/types/user'
import { Resource } from '../core/types/api'
import { ActivityLog } from '@prisma/client'

export class CommentService extends BaseService {
  async createComment(data: CreateComment) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.Comment)

    const comment = await this.db.comment.create({
      data: {
        ...data,
        taskId: data.taskId,
        workspaceId: this.user.workspaceId,
      },
    })

    return comment
  }

  async deleteComment(id: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Delete, Resource.Comment)

    return await this.db.comment.delete({ where: { id } })
  }

  async updateComment(id: string, data: UpdateComment) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Update, Resource.Comment)

    const updatedComment = await this.db.comment.update({
      where: { id },
      data: {
        ...data,
      },
    })

    return updatedComment
  }
}
