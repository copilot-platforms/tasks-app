import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { UserAction } from '@api/core/types/user'
import { Resource } from '@api/core/types/api'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'

export class AttachmentsService extends BaseService {
  async getAttachments(id: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.Attachments)

    const attachments = await this.db.attachment.findMany({
      where: {
        taskId: id,
      },
    })

    return attachments
  }

  async createAttachments(data: CreateAttachmentRequest) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.Attachments)

    const newAttachment = await this.db.attachment.create({
      data: {
        ...data,
        createdById: this.user.internalUserId as string,
      },
    })

    return newAttachment
  }

  async deleteAttachment(id: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Delete, Resource.Attachments)

    const deletedAttachment = await this.db.attachment.delete({ where: { id } })

    return deletedAttachment
  }
}
