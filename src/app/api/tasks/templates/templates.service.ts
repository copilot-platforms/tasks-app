import { CreateTemplateRequest, UpdateTemplateRequest } from '@/types/dto/templates.dto'
import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { UserAction } from '@api/core/types/user'
import { z } from 'zod'

export class TemplatesService extends BaseService {
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

  async createTaskTemplate(payload: CreateTemplateRequest) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.TaskTemplates)

    let templates = await this.db.taskTemplate.create({
      data: {
        ...payload,
        workspaceId: this.user.workspaceId,
        createdBy: z.string().parse(this.user.internalUserId),
      },
    })
    return templates
  }

  async updateTaskTemplate(id: string, payload: UpdateTemplateRequest) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Update, Resource.TaskTemplates)

    let template = await this.db.taskTemplate.update({
      where: { id, workspaceId: this.user.workspaceId },
      data: payload,
    })
    return template
  }

  async deleteTaskTemplate(id: string) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Delete, Resource.TaskTemplates)

    let template = await this.db.taskTemplate.delete({
      where: { id, workspaceId: this.user.workspaceId },
    })
    return template
  }
}
