import User from '@api/core/models/User.model'
import { BaseService } from '@api/core/services/base.service'
import { TaskWithWorkflowState } from '@api/tasks/service'

export class TaskUpdateService extends BaseService {
  constructor(
    user: User,
    private prevTask: TaskWithWorkflowState,
    private newTask: TaskWithWorkflowState,
  ) {
    super(user)
  }
}
