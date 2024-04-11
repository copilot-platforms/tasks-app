import { BaseService } from '../core/services/base.service'

export class TasksService extends BaseService {
  async getAllTasks({ workspaceId }: { workspaceId: string }) {
    return this.db.task.findMany()
  }
}
