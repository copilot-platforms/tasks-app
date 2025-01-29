import { CopilotAPI } from '@/utils/CopilotAPI'
import { BaseService } from '@api/core/services/base.service'
import User from '@api/core/models/User.model'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { UserAction, UserRole } from '@api/core/types/user'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'
import { CompanyResponse, CopilotListArgs, FilterableUser } from '@/types/common'
import { filterUsersByKeyword } from '@/utils/users'
import { z } from 'zod'
import { FilterOptionsKeywords } from '@/types/interfaces'
import { orderByRecentlyCreatedAt } from '@/utils/ordering'
import { MAX_FETCH_ASSIGNEE_COUNT } from '@/constants/users'

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
      this.copilot.getClients({ limit: MAX_FETCH_ASSIGNEE_COUNT, nextToken }),
      this.copilot.getCompanies({ limit: MAX_FETCH_ASSIGNEE_COUNT, nextToken }),
    ])

    // Get current internal user as only IUs are authenticated to access this route
    const currentInternalUser = await this.copilot.getInternalUser(z.string().parse(this.user.internalUserId))
    // Filter out companies where isPlaceholder is true if companies.data is not null
    // Also filter out just companies which are accessible to this IU, since copilot doesn't do that
    const currentWorkspace = await this.copilot.getWorkspace()

    // If current workspace setting does not have companies enabled, don't return any companies
    let filteredCompanies: CompanyResponse[] = []
    if (currentWorkspace.isCompaniesEnabled && companies.data) {
      filteredCompanies = companies.data
        .filter((company) => !company.isPlaceholder)
        .filter((company) =>
          currentInternalUser.isClientAccessLimited ? currentInternalUser.companyAccessList?.includes(company.id) : true,
        )
        .slice(0, limit)
    }

    // Same for clients
    const clientsWithCompanyData = clients.data || []
    const accessibleClients = (
      currentInternalUser.isClientAccessLimited
        ? clientsWithCompanyData?.filter((client) => currentInternalUser.companyAccessList?.includes(client.companyId))
        : clientsWithCompanyData
    )?.slice(0, limit)

    const internalUsers = [
      currentInternalUser,
      ...orderByRecentlyCreatedAt(ius.data.filter((user) => user.id !== currentInternalUser.id)),
    ] //Always keeping the current user at the first of the list.

    return {
      // CopilotAPI doesn't currently support sorting data, so manually sort them before returning a response
      internalUsers,
      clients: orderByRecentlyCreatedAt(accessibleClients),
      companies: orderByRecentlyCreatedAt(filteredCompanies),
    }
  }

  /**
   * Service to filter users starting with a given keyword
   * @param keyword
   * @returns
   */
  async getFilteredUsersStartingWith(keyword: string, userType?: string, limit?: number, nextToken?: string) {
    const filterByKeyword = (users: FilterableUser[]) => filterUsersByKeyword(users, keyword)

    if (userType) {
      if (userType === FilterOptionsKeywords.CLIENTS) {
        const { clients, companies } = await this.getGroupedUsers(limit || 500, nextToken)
        return {
          clients: filterByKeyword(clients),
          companies: filterByKeyword(companies),
        }
      }

      if (userType === FilterOptionsKeywords.TEAM) {
        const { internalUsers } = await this.getGroupedUsers(limit || 500, nextToken)
        return {
          internalUsers: filterByKeyword(internalUsers),
        }
      }
    }
    const { internalUsers, clients, companies } = await this.getGroupedUsers(limit || 500, nextToken)
    return {
      internalUsers: filterByKeyword(internalUsers),
      clients: filterByKeyword(clients),
      companies: filterByKeyword(companies),
    }
  }

  async getClient(limit: number = this.DEFAULT_USERS_LIMIT) {
    const user = this.user
    //Apply custom authorization here. Policy service is not used because this api is for client's task-assignee match function to get clients from same organizations only. Only clients can use this.
    if (user.role !== UserRole.Client) {
      throw new APIError(httpStatus.UNAUTHORIZED, 'You are not authorized to perform this action')
    }
    const [clients, companies, internalUsers] = await Promise.all([
      this.copilot.getClients({ limit }),
      this.copilot.getCompanies({ limit }),
      this.copilot.getInternalUsers(),
    ])

    // Filter out companies where isPlaceholder is true if companies.data is not null
    const filteredCompanies = companies.data ? companies.data.filter((company) => !company.isPlaceholder) : []

    return { clients: clients.data, companies: filteredCompanies, internalUsers: internalUsers.data }
  }
}

export default UsersService
