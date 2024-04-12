import { UserAction, UserRole } from '@api/core/types/user'
import User from '@api/core/models/User.model'
import { Routes } from '../types/api'

/*
  Resource-level policies control service for Users (IU + Client)
*/
export class PoliciesService {
  private user: User
  private defaultPolicies: Record<UserRole.Client, Record<Routes, UserAction[]>> = {
    [UserRole.Client]: {
      [Routes.Tasks]: ['read'],
    },
  }

  constructor(user: User) {
    this.user = user
  }

  can(action: UserAction, route: Routes): boolean {
    // In the future if we want configurable permissions, we can set them here
    if (this.user.role === UserRole.IU) {
      return true
    }

    const userPolicy = this.defaultPolicies[this.user.role][route]
    return userPolicy.includes('all') || userPolicy.includes(action)
  }
}
