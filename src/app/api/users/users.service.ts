import { CopilotAPI } from '@/utils/CopilotAPI'
import { BaseService } from '@api/core/services/base.service'
import User from '@api/core/models/User.model'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { UserAction } from '@api/core/types/user'

class UsersService extends BaseService {
  private copilot: CopilotAPI

  constructor(user: User) {
    super(user)
    this.copilot = new CopilotAPI(this.user.token)
  }

  async getGroupedUsers() {
    const user = this.user
    new PoliciesService(user).authorize(UserAction.Read, Resource.Users)

    const [ius, clients, companies] = await Promise.all([
      this.copilot.getInternalUsers(),
      this.copilot.getClients(),
      this.copilot.getCompanies(),
    ])

    return { internalUsers: ius.data, clients: clients.data, companies: companies.data }
  }
}

export default UsersService
