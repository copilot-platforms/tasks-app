import User from '../core/models/User.model'
import { BaseService } from '../core/services/base.service'
import { Routes } from '../core/types/api'
import { UserRole } from '../core/types/user'

export class TasksService extends BaseService {
  async getAllTasks(user: User) {
    if (!user.can('read', Routes.Tasks)) {
      throw new APIError(401, 'You are not authorized to perform this action')
    }

    const filters = { where: { workspaceId: user.workspaceId } }
    if (user.role === UserRole.Client) {
      // @ts-expect-error fix in future
      filters.where.clientId = user.clientId
      if (user.companyId) {
        // @ts-expect-error fix in future
        filters.where.companyId = user.companyId
      }
    }

    return await this.db.task.findMany(filters)
  }
}
