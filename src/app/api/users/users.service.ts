import { CopilotAPI } from '@/utils/CopilotAPI'
import { BaseService } from '../core/services/base.service'
import User from '../core/models/User.model'
import { PoliciesService } from '../core/services/policies.service'
import { Resource } from '../core/types/api'

class UsersService extends BaseService {
  private copilot: CopilotAPI

  constructor(user: User) {
    super(user)
    this.copilot = new CopilotAPI(this.user.token)
  }

  async getGroupedUsers() {
    const user = this.user
    new PoliciesService(user).authorize('read', Resource.Users)

    const [ius, clients, companies] = await Promise.all([
      this.copilot.getInternalUsers(),
      this.copilot.getClients(),
      this.copilot.getCompanies(),
    ])

    return { ius: ius.data, clients: clients.data, companies: companies.data }
  }
}

export default UsersService
