import { BaseService } from '@api/core/services/base.service'
import { CreateWorkflowStateRequest } from '@/types/dto/workflowStates.dto'
import { Resource } from '@api/core/types/api'
import { toCamelCase } from '@/utils/string'
import { PoliciesService } from '@api/core/services/policies.service'

class WorkflowStatesService extends BaseService {
  async getAllWorkflowStates() {
    const user = this.user
    new PoliciesService(user).authorize('read', Resource.WorkflowState)

    const filters = { where: { workspaceId: user.workspaceId } }
    return await this.db.workflowState.findMany(filters)
  }

  async createWorkflowStates(data: CreateWorkflowStateRequest) {
    const user = this.user
    new PoliciesService(user).authorize('create', Resource.WorkflowState)

    return await this.db.workflowState.create({
      data: {
        ...data,
        key: toCamelCase(data.name),
        workspaceId: this.user.workspaceId,
      },
    })
  }
}

export default WorkflowStatesService
