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
    const existing = await this.db.scrapImage.findFirst({
      where: {
        filePath: data.filePath,
      },
    })
    if (!existing) {
      await this.db.scrapImage.create({
        data: {
          ...data,
        },
      })
    } else {
      await this.db.scrapImage.update({
        where: {
          id: existing.id,
        },
        data: {
          updatedAt: new Date(), //update the scrapImage if it exists in the table already
        },
      })
    }
  }

  async updateTaskIdOfScrapImagesAfterCreation(htmlString: string, task_id: string) {
    const imgTagRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/g //expression used to match all img tags in provided HTML string.
    let match
    const filePaths: string[] = []
    while ((match = imgTagRegex.exec(htmlString)) !== null) {
      const originalSrc = match[1]
      const filePath = await getFilePathFromUrl(originalSrc)
      if (filePath) {
        filePaths.push(filePath)
      }
    }

    await this.db.scrapImage.updateMany({
      where: {
        filePath: {
          in: filePaths,
        },
      },
      data: {
        taskId: task_id,
      },
    })
  }
}
