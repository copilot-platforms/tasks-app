import { BaseService } from '../_base/base.service'

export class TasksService extends BaseService {
  async getAllTasks() {
    return this.db.task.findMany()
  }
}
