import { BaseService } from '@api/core/services/base.service'

export class SubtaskService extends BaseService {
  async getSubtaskCounts(parentId: string) {
    return await this.db.task.count({
      where: { parentId, workspaceId: this.user.workspaceId },
    })
  }
}
