import { MAX_FETCH_ASSIGNEE_COUNT } from '@/constants/users'
import { ClientResponse, CompanyResponse, FilterableUser, InternalUsers } from '@/types/common'
import { FilterOptionsKeywords } from '@/types/interfaces'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { orderByRecentlyCreatedAt } from '@/utils/ordering'
import { filterUsersByKeyword } from '@/utils/users'
import APIError from '@api/core/exceptions/api'
import User from '@api/core/models/User.model'
import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { UserAction, UserRole } from '@api/core/types/user'
import httpStatus from 'http-status'

class UsersService extends BaseService {
  private copilot: CopilotAPI

  constructor(user: User) {
    super(user)
    this.copilot = new CopilotAPI(this.user.token)
  }

  private limitUsers<T>(users: T[], limit?: number): T[] {
    if (!limit) return users

    // Do not slice array unless limit is present - minor optimization
    return users.slice(0, limit)
  }

  async getGroupedUsers(limit?: number, nextToken?: string) {
    const user = this.user
    new PoliciesService(user).authorize(UserAction.Read, Resource.Users)

    // NOTE: Get currentInternalUser with a separate CopilotAPI call. This adds a
    // Copilot call, but saves us from having to `.find` in a potentially large array

    const [currentInternalUser, ius, clients, companies, currentWorkspace] = await Promise.all([
      this.copilot.getInternalUser(user.internalUserId!),
      this.copilot.getInternalUsers({ limit: MAX_FETCH_ASSIGNEE_COUNT, nextToken }),
      this.copilot.getClients({ limit: MAX_FETCH_ASSIGNEE_COUNT, nextToken }),
      this.copilot.getCompanies({ limit: MAX_FETCH_ASSIGNEE_COUNT, nextToken, isPlaceholder: false }),
      this.copilot.getWorkspace(),
    ])

    if (!currentInternalUser) {
      throw new APIError(httpStatus.UNAUTHORIZED, 'Only internal users are allowed to access this resource')
    }

    const processIus = (ius: InternalUsers[]) => {
      return [currentInternalUser, ...orderByRecentlyCreatedAt(ius.filter((user) => user.id !== currentInternalUser.id))]
    }

    const processClients = (clients: ClientResponse[]) => {
      if (!currentInternalUser.isClientAccessLimited) return clients

      return clients.reduce((acc, client) => {
        const allowedCompanyIds = client.companyIds?.filter((id) => currentInternalUser.companyAccessList?.includes(id))
        if (allowedCompanyIds?.length) {
          acc.push({ ...client, companyIds: allowedCompanyIds })
        }
        return acc
      }, [] as ClientResponse[])
    }

    const processCompanies = (companies: CompanyResponse[]) => {
      if (!currentWorkspace.isCompaniesEnabled) return []
      if (!currentInternalUser.isClientAccessLimited) return companies

      return companies.filter((company) => currentInternalUser.companyAccessList?.includes(company.id))
    }

    const processedIus = processIus(ius.data)
    const processedClients = processClients(clients.data || [])
    const processedCompanies = processCompanies(companies.data || [])

    return {
      internalUsers: this.limitUsers(processedIus, limit),
      clients: this.limitUsers(processedClients, limit),
      companies: this.limitUsers(processedCompanies, limit),
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

  async getUsersForClients(limit?: number) {
    const user = this.user
    //Apply custom authorization here. Policy service is not used because this api is for client's task-assignee match function to get clients from same organizations only. Only clients can use this.
    if (user.role !== UserRole.Client) {
      throw new APIError(httpStatus.UNAUTHORIZED, 'You are not authorized to perform this action')
    }
    const [clients, companies, internalUsers] = await Promise.all([
      this.copilot.getClients({ limit }),
      this.copilot.getCompanies({ limit, isPlaceholder: false }),
      this.copilot.getInternalUsers({ limit }),
    ])

    return { clients: clients.data, companies: companies.data, internalUsers: internalUsers.data }
  }
}

export default UsersService
