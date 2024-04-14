import { BaseService } from '@api/core/services/base.service'
import { CreateStatusRequest } from '@/types/dto/status.dto'
import { Resource } from '@api/core/types/api'
import { toCamelCase } from '@/utils/string'
import APIError from '@api/core/exceptions/api'
import { PoliciesService } from '../core/services/policies.service'

export class StatusService extends BaseService {
  async getAllStatus() {
    const user = this.user
    new PoliciesService(user).authorize('read', Resource.Status)

    const filters = { where: { workspaceId: user.workspaceId } }
    return await this.db.statusSetting.findMany(filters)
  }

  async createStatus(data: CreateStatusRequest) {
    const user = this.user
    new PoliciesService(user).authorize('create', Resource.Status)

    return await this.db.statusSetting.create({
      data: {
        ...data,
        key: toCamelCase(data.name),
        workspaceId: this.user.workspaceId,
      },
    })
  }
}
