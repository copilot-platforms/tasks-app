import { BaseService } from '@api/core/services/base.service'
import { CreateStatusRequest } from '@/types/dto/status.dto'
import { Resource } from '@api/core/types/api'
import { toCamelCase } from '@/utils/string'

export class StatusService extends BaseService {
  async getAllStatus() {
    const user = this.user

    if (!user.can('read', Resource.Status)) {
      throw new APIError(401, 'You are not authorized to perform this action')
    }

    const filters = { where: { workspaceId: user.workspaceId } }
    return await this.db.statusSetting.findMany(filters)
  }

  async createStatus(data: CreateStatusRequest) {
    const user = this.user

    if (!user.can('create', Resource.Status)) {
      throw new APIError(401, 'You are not authorized to perform this action')
    }

    return await this.db.statusSetting.create({
      data: {
        ...data,
        key: toCamelCase(data.name),
        workspaceId: this.user.workspaceId,
      },
    })
  }
}
