import { CopilotAPI } from '@/utils/CopilotAPI'
import { BaseService } from '@api/core/services/base.service'
import User from '@api/core/models/User.model'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { UserAction, UserRole } from '@api/core/types/user'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'
import { CopilotListArgs } from '@/types/common'

class UsersService extends BaseService {
  private copilot: CopilotAPI

  constructor(user: User) {
    super(user)
    this.copilot = new CopilotAPI(this.user.token)
  }

  async getGroupedUsers() {
    const user = this.user
    new PoliciesService(user).authorize(UserAction.Read, Resource.Users)

    const listArgs: CopilotListArgs = {
      // We want the complete list of users / companies for now
      limit: 10000,
    }

    const [ius, clients, companies] = await Promise.all([
      this.copilot.getInternalUsers(listArgs),
      this.copilot.getClients(listArgs),
      this.copilot.getCompanies(listArgs),
    ])

    // Filter out companies where isPlaceholder is true if companies.data is not null
    const filteredCompanies = companies.data ? companies.data.filter((company) => !company.isPlaceholder) : []
    const clientsWithCompanyData = clients.data?.map((client) => {
      const companyForClient = filteredCompanies.find((company) => company.id === client.companyId)
      return { ...client, fallbackColor: companyForClient?.fallbackColor }
    })

    return { internalUsers: ius.data, clients: clientsWithCompanyData, companies: filteredCompanies }
  }

  async getClient() {
    const user = this.user
    //Apply custom authorization here. Policy service is not used because this api is for client's task-assignee match function to get clients from same organizations only. Only clients can use this.
    if (user.role !== UserRole.Client) {
      throw new APIError(httpStatus.UNAUTHORIZED, 'You are not authorized to perform this action')
    }
    const clients = await this.copilot.getClients()
    const filteredClients = user.companyId
      ? clients.data?.filter((el) => el.companyId == user.companyId)
      : clients.data?.filter((el) => el.id == user.clientId)
    return { clients: filteredClients }
  }
}

export default UsersService
