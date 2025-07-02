/**
 * All utils related to the Copilot selector component
 */

import { IAssigneeCombined, InputValue, ISelectorAssignee, ISelectorOption, UserIds } from '@/types/interfaces'
import { userIdFieldMap } from '@/types/objectMaps'
import { UserIdsType } from './assignee'

export const getSelectedUserIds = (inputValue: InputValue[]): UserIdsType => {
  let userIds: UserIdsType = {
    [UserIds.INTERNAL_USER_ID]: null,
    [UserIds.CLIENT_ID]: null,
    [UserIds.COMPANY_ID]: null,
  }
  if (!inputValue?.length) {
    return userIds
  } // when no user is selected.

  const newValue = inputValue[0] //done to support single selection only, once the UserCompanySelector component supports single selection, this logic will need to be updated.
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

export const selectorOptionsToInputValue = (options: ISelectorOption[]): InputValue[] =>
  options.map((option) => ({
    id: option.value,
    object: option.type,
    companyId: option.companyId,
  }))

export const updateCompanyIdOfSelectedAssignee = (value: IAssigneeCombined | undefined, companyId: string | null) => {
  if (!value) return null
  return { ...value, companyId: companyId ?? undefined }
} //util to update companyId for the selected assignee for copilot selector
