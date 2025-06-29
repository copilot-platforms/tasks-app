import { UserAction, UserRole } from '@api/core/types/user'
import { Resource } from '@api/core/types/api'
import { BaseService } from './base.service'
import APIError from '@api/core/exceptions/api'
import httpStatus from 'http-status'

/**
 * Service for resource-level policy enforcement for Users (IU + Client).
 * Ensures that policy structure and access logic is strongly typed and isolated.
 */
export class PoliciesService extends BaseService {
  constructor(user: import('@api/core/models/User.model').default) {
    super({ user })
  }
  /**
   * Default allowed actions for CLIENT users per resource.
   * Internal users have full access and skip this map.
   */
  private readonly defaultPolicies: Readonly<Record<UserRole.Client, Record<Resource, ReadonlyArray<UserAction>>>> = {
    [UserRole.Client]: {
      [Resource.Tasks]: [UserAction.Read],
      [Resource.TaskTemplates]: [],
      [Resource.WorkflowState]: [UserAction.Read],
      [Resource.ViewSetting]: [UserAction.Read, UserAction.Create],
      [Resource.Users]: [],
      [Resource.Attachments]: [UserAction.Read, UserAction.Create, UserAction.Delete],
      [Resource.Comment]: [UserAction.Read, UserAction.Create, UserAction.Update],
      [Resource.ScrapMedias]: [],
      [Resource.Notifications]: [UserAction.Update],
    },
  } as const

  /**
   * Checks whether the user is authorized for a particular action and resource.
   * Throws if not authorized. Returns true if permitted.
   */
  authorize(action: UserAction, resource: Resource): true {
    // Internal users (IUs) have unrestricted access
    if (this.user.role === UserRole.IU) {
      return true
    }

    // For all others, check the policy map
    const userPolicy = this.defaultPolicies[this.user.role]?.[resource] ?? []
    const isAuthorized = userPolicy.includes(UserAction.All) || userPolicy.includes(action)
    if (!isAuthorized) {
      throw new APIError(httpStatus.UNAUTHORIZED, 'You are not authorized to perform this action')
    }
    return true
  }
}
