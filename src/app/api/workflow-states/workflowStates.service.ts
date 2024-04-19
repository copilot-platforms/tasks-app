import { BaseService } from '@api/core/services/base.service'
import { CreateWorkflowStateRequest } from '@/types/dto/workflowStates.dto'
import { Resource } from '@api/core/types/api'
import { generateRandomString, toCamelCase } from '@/utils/string'
import { PoliciesService } from '@api/core/services/policies.service'
import { UserAction } from '@api/core/types/user'

class WorkflowStatesService extends BaseService {
  async getAllWorkflowStates() {
    // Check if current user is authorized to access this resource
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.Tasks)

    const filters = { where: { workspaceId: this.user.workspaceId } }
    return await this.db.workflowState.findMany(filters)
  }

  async createWorkflowStates(data: CreateWorkflowStateRequest) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.Tasks)

    return await this.db.workflowState.create({
      data: {
        ...data,
        key: await this.generateKey(data.name),
        workspaceId: this.user.workspaceId,
      },
    })
  }

  private async generateKey(name: string) {
    let key = toCamelCase(name)
    // If a key matching existing record exists, append a random
    // string since we have UQ_WorkflowState_workspaceId_key constraint
    const matchingKeyRecord = await this.db.workflowState.findFirst({ where: { key } })
    if (matchingKeyRecord) key += `-${generateRandomString(3)}`

    return key
  }
}

export default WorkflowStatesService
