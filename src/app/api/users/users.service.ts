import { CopilotAPI } from '@/utils/CopilotAPI'
import { BaseService } from '@api/core/services/base.service'
import User from '@api/core/models/User.model'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { UserAction, UserRole } from '@api/core/types/user'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'
import { CopilotListArgs, FilterableUser } from '@/types/common'
import { filterUsersByKeyword } from '@/utils/users'

class UsersService extends BaseService {
  private copilot: CopilotAPI
  private DEFAULT_USERS_LIMIT = 10

  constructor(user: User) {
    super(user)
    this.copilot = new CopilotAPI(this.user.token)
  }

  async getGroupedUsers(limit: number = this.DEFAULT_USERS_LIMIT, nextToken?: string) {
    const user = this.user
    new PoliciesService(user).authorize(UserAction.Read, Resource.Users)

    const listArgs: CopilotListArgs = { limit, nextToken }

    const [ius, clients, companies] = await Promise.all([
      this.copilot.getInternalUsers(listArgs),
      this.copilot.getClients(listArgs),
      this.copilot.getCompanies(listArgs),
    ])

    // Filter out companies where isPlaceholder is true if companies.data is not null
    const filteredCompanies = companies.data ? companies.data.filter((company) => !company.isPlaceholder) : []
    const clientsWithCompanyData =
      clients.data?.map((client) => {
        const companyForClient = filteredCompanies.find((company) => company.id === client.companyId)
        return { ...client, fallbackColor: companyForClient?.fallbackColor }
      }) || []

    return { internalUsers: ius.data, clients: clientsWithCompanyData, companies: filteredCompanies }
  }

  /**
   * Service to filter users starting with a given keyword
   * @param keyword
   * @returns
   */
  async getFilteredUsersStartingWith(keyword: string, limit?: number, nextToken?: string) {
    const filterByKeyword = (users: FilterableUser[]) => filterUsersByKeyword(users, keyword)

    const { internalUsers, clients, companies } = await this.getGroupedUsers(limit || 500, nextToken)
    return {
      internalUsers: filterByKeyword(internalUsers),
      clients: filterByKeyword(clients),
      companies: filterByKeyword(companies),
    }
  }

  async getClient() {
    const user = this.user
    //Apply custom authorization here. Policy service is not used because this api is for client's task-assignee match function to get clients from same organizations only. Only clients can use this.
    if (user.role !== UserRole.Client) {
      throw new APIError(httpStatus.UNAUTHORIZED, 'You are not authorized to perform this action')
    }
    const [clients, companies] = await Promise.all([this.copilot.getClients(), this.copilot.getCompanies()])

    // Filter out companies where isPlaceholder is true if companies.data is not null
    const filteredCompanies = companies.data ? companies.data.filter((company) => !company.isPlaceholder) : []

    return { clients: clients.data, companies: filteredCompanies }
  }
}

export default UsersService
