import { CreateTaskRequest, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { BaseService } from '@api/core/services/base.service'
import { Resource } from '@api/core/types/api'
import { UserRole } from '@api/core/types/user'
import APIError from '@api/core/exceptions/api'
import { PoliciesService } from '../core/services/policies.service'

export class TasksService extends BaseService {
  async getAllTasks() {
    const user = this.user
    new PoliciesService(user).authorize('read', Resource.Tasks)

    const filters = { where: { workspaceId: user.workspaceId } }
    if (user.role === UserRole.Client) {
      // @ts-expect-error fix in future
      filters.where.assigneeId = user.clientId
      // @ts-expect-error fix in future
      filters.where.assigneeType = 'client'
      if (user.companyId) {
        // @ts-expect-error fix in future
        filters.where.OR = [
          { assigneeId: user.clientId, assigneeType: 'client' },
          { assigneeId: user.companyId, assigneeType: 'company' },
        ]
      }
    }

    return await this.db.task.findMany({
      ...filters,
      include: {
        status: { select: { name: true } },
      },
    })
  }

  async createTask(data: CreateTaskRequest) {
    const user = this.user
    new PoliciesService(user).authorize('create', Resource.Tasks)

    return await this.db.task.create({
      data: {
        ...data,
        workspaceId: this.user.workspaceId,
        createdBy: this.user.internalUserId as string,
      },
    })
  }

  async getOneTask() {
    const user = this.user
    new PoliciesService(user).authorize('read', Resource.Tasks)

    const filters = { where: { workspaceId: user.workspaceId } }
    if (user.role === UserRole.Client) {
      // @ts-expect-error fix in future
      filters.where.assigneeId = user.clientId
      // @ts-expect-error fix in future
      filters.where.assigneeType = 'client'
      if (user.companyId) {
        // @ts-expect-error fix in future
        filters.where.OR = [
          { assigneeId: user.clientId, assigneeType: 'client' },
          { assigneeId: user.companyId, assigneeType: 'company' },
        ]
      }
    }

    return await this.db.task.findFirst({
      ...filters,
      include: {
        status: true,
      },
    })
  }

  async updateOneTask(id: string, data: UpdateTaskRequest) {
    const user = this.user
    new PoliciesService(user).authorize('update', Resource.Tasks)

    return await this.db.task.update({
      where: { id },
      data,
    })
  }

  async deleteOneTask(id: string) {
    const user = this.user
    new PoliciesService(user).authorize('delete', Resource.Tasks)

    return await this.db.task.delete({ where: { id } })
  }
}
