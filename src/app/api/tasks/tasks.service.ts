import { CreateTaskRequest, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { BaseService } from '@api/core/services/base.service'
import { Resource } from '@api/core/types/api'
import { PoliciesService } from '@api/core/services/policies.service'
import { AssigneeType } from '@prisma/client'

type FilterByAssigneeId = {
  assigneeId: string
  assigneeType: AssigneeType
}

export class TasksService extends BaseService {
  /**
   * Builds filter for "get" service methods.
   * If user is an IU, return filter for all tasks associated with this workspace
   * If user is a client, return filter for just the tasks assigned to this clientId.
   * If user is a client and has a companyId, return filter for just the tasks assigned to this clientId `OR` to this companyId
   */
  private buildReadFilters() {
    const user = this.user

    let filters = { where: { workspaceId: user.workspaceId, OR: undefined as unknown as FilterByAssigneeId[] } }

    if (user.clientId) {
      filters = {
        where: {
          ...filters.where,
          OR: [{ assigneeId: user.clientId as string, assigneeType: 'client' }],
        },
      }
    }
    if (user.clientId && user.companyId) {
      filters = {
        where: {
          ...filters.where,
          OR: [
            { assigneeId: user.clientId as string, assigneeType: 'client' },
            { assigneeId: user.companyId, assigneeType: 'company' },
          ],
        },
      }
    }

    return filters
  }

  async getAllTasks() {
    const user = this.user
    new PoliciesService(user).authorize('read', Resource.Tasks)
    const filters = this.buildReadFilters()

    return await this.db.task.findMany({
      ...filters,
      include: {
        workflowState: { select: { name: true } },
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

    const filters = this.buildReadFilters()

    return await this.db.task.findFirst({
      ...filters,
      include: {
        workflowState: true,
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
