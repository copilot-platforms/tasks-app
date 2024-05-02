import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { UserAction } from '@api/core/types/user'

export class TaskTemplatesService extends BaseService {
  async getTaskTemplates() {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.TaskTemplates)

    let templates = await this.db.taskTemplate.findMany({
      where: { workspaceId: this.user.workspaceId },
    })
    return templates
  }

  async getTaskTemplate(id: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.TaskTemplates)

    let templates = await this.db.taskTemplate.findFirst({
      where: { id, workspaceId: this.user.workspaceId },
    })
    return templates
  }

  async createTaskTemplate() {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.TaskTemplates)

    let templates = await this.db.taskTemplate.findMany({
      where: { workspaceId: this.user.workspaceId },
    })
    return templates
  }

  async updateTaskTemplate() {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Update, Resource.TaskTemplates)

    let templates = await this.db.taskTemplate.findMany({
      where: { workspaceId: this.user.workspaceId },
    })
    return templates
  }

  async deleteTaskTemplate() {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Delete, Resource.TaskTemplates)

    let templates = await this.db.taskTemplate.findMany({
      where: { workspaceId: this.user.workspaceId },
    })
    return templates
  }
}
