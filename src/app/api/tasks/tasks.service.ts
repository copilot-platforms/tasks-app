import DBClient from '@/lib/db'
import { UserRole } from '@/types/api'
import { Token } from '@/types/common'
import { BaseService } from '../_base/base.service'

export class TasksService extends BaseService {
  async getTasksForUserRole(role: UserRole, tokenPayload: Token) {
    return await this.db.task.findMany({
      where: {
        workspaceId: tokenPayload.workspaceId,
        assigneeId: role === 'client' ? tokenPayload.clientId : undefined,
      },
    })
  }
}
