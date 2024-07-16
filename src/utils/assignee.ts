import { FilterByOptions, IAssigneeCombined, IIus } from '@/types/interfaces'
import { truncateText } from './truncateText'
import { TruncateMaxNumber } from '@/types/constants'
import { z } from 'zod'
import { InternalUsers } from '@/types/common'

export const isAssigneeTextMatching = (newInputValue: string, assigneeValue: IAssigneeCombined): boolean => {
  const truncate = (newInputValue: string) => truncateText(newInputValue, TruncateMaxNumber.SELECTOR)
  return (
    truncate(newInputValue) === truncate(`${assigneeValue?.givenName} ${assigneeValue?.familyName}`.trim()) ||
    truncate(newInputValue) === truncate(assigneeValue?.name?.trim() || '')
  )
}

export const getAccessibleUsersList = (
  users: IAssigneeCombined[],
  currentInternalUser?: InternalUsers,
): IAssigneeCombined[] => {
  return currentInternalUser?.isClientAccessLimited
    ? users.filter((user) => {
        if (user.type === FilterByOptions.IUS) {
          return true
        }

        const companyId = user.type === FilterByOptions.CLIENT ? z.string().parse(user.companyId) : user.id
        // If currently logged in IU has restricted company access, make sure to filter out companies that aren't in its company access list
        const companyAccessList = currentInternalUser.companyAccessList || [] // There seems to be data where access is restricted but companyAccessList is still null
        return companyAccessList.includes(companyId)
      })
    : users
}
