import { UserAction, UserRole } from '@api/core/types/user'
import { Resource } from '@api/core/types/api'
import { BaseService } from './base.service'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'

/**
 * Resource-level policies control service for Users (IU + Client)
 * Designed to be called at the service level to check if the actions the service is going to do is permitted for this user
 */
export class PoliciesService extends BaseService {
  private readonly defaultClientPolicies: Record<Resource, UserAction[]> = {
    [Resource.Tasks]: [UserAction.Read],
    [Resource.WorkflowState]: [UserAction.Read],
    [Resource.ViewSetting]: [],
  }

  authorize(action: UserAction, resource: Resource): boolean | void {
    // In the future if we want configurable permissions, we can set them here

    // If user role is IU, grant them unrestricted access to all resources
    if (this.user.role === UserRole.IU) {
      return true
    }

    // Grab client policies from `defaultClientPolicies`
    const clientPolicyForResource = this.defaultClientPolicies[resource]
    const isAuthorized = clientPolicyForResource.includes(UserAction.All) || clientPolicyForResource.includes(action)
    if (!isAuthorized) {
      throw new APIError(httpStatus.UNAUTHORIZED, 'You are not authorized to perform this action')
    }
  }
}
