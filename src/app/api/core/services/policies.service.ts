import { UserAction, UserRole } from '@api/core/types/user'
import { Resource } from '@api/core/types/api'
import { BaseService } from './base.service'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'

/**
 * Resource-level policies control service for Users (IU + Client)
 */
export class PoliciesService extends BaseService {
  private defaultPolicies: Record<UserRole.Client, Record<Resource, UserAction[]>> = {
    [UserRole.Client]: {
      [Resource.Tasks]: ['read'],
      [Resource.Status]: ['read'],
    },
  }

  authorize(action: UserAction, resource: Resource): boolean | void {
    // In the future if we want configurable permissions, we can set them here
    if (this.user.role === UserRole.IU) {
      return true
    }

    const userPolicy = this.defaultPolicies[this.user.role][resource]
    const isAuthorized = userPolicy.includes('all') || userPolicy.includes(action)
    if (!isAuthorized) {
      throw new APIError(httpStatus.UNAUTHORIZED, 'You are not authorized to perform this action')
    }
  }
}
