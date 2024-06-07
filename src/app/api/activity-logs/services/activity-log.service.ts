import { BaseService } from '@api/core/services/base.service'
import User from '@api/core/models/User.model'

export class ActivityLogService extends BaseService {
  constructor(user: User) {
    super(user)
  }

  get(taskId: string) {}
}
