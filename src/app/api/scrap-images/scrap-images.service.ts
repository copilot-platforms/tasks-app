import { ScrapImageRequest } from '@/types/common'
import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { UserAction } from '@api/core/types/user'
import { Resource } from '@api/core/types/api'
import { getFilePathFromUrl } from '@/utils/signedUrlReplacer'

export class ScrapImageService extends BaseService {
  async createScrapImage(data: ScrapImageRequest) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Update, Resource.Tasks)
    const existing = await this.db.scrapAttachment.findFirst({
      where: {
        filePath: data.filePath,
      },
    })
    if (!existing) {
      await this.db.scrapAttachment.create({
        data: {
          ...data,
          workspaceId: this.user.workspaceId,
        },
      })
    } else {
      await this.db.scrapAttachment.update({
        where: {
          id: existing.id,
        },
        data: {
          updatedAt: new Date(), //update the scrapImage if it exists in the table already
        },
      })
    }
  }
}
