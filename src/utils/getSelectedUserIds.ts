import { IUserIds, UserIds } from '@/types/interfaces'
import { userIdFieldMap } from '@/types/objectMaps'
import { InputValue } from 'copilot-design-system'

/**
 * A utility function to extract selected user IDs from the input values of a UserCompanySelector component from the copilot-design-system.
 *
 * @param {InputValue[]} inputValue
 * @returns {IUserIds}
 */

export const getSelectedUserIds = (inputValue: InputValue[]): IUserIds => {
  let userIds: IUserIds = {
    [UserIds.INTERNAL_USER_ID]: null,
    [UserIds.CLIENT_ID]: null,
    [UserIds.COMPANY_ID]: null,
  }
  if (!inputValue?.length) {
    return userIds
  } // when no user is selected.

  const newValue = inputValue[0]
  const activeKey = userIdFieldMap[newValue.object as keyof typeof userIdFieldMap]
  userIds = {
    [UserIds.INTERNAL_USER_ID]: null,
    [UserIds.CLIENT_ID]: null,
    [UserIds.COMPANY_ID]: null,
    [activeKey]: newValue.id,
  }
  if (newValue.companyId) {
    userIds[UserIds.COMPANY_ID] = newValue.companyId
  }

  return userIds
}
