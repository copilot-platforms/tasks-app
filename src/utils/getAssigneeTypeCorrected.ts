import { IAssigneeCombined, UserIds } from '@/types/interfaces'
import { AssigneeType } from '@prisma/client'

export const getAssigneeTypeCorrected = (assignee: IAssigneeCombined) => {
  return assignee?.type === 'internalUsers'
    ? AssigneeType.internalUser
    : assignee?.type === 'clients'
      ? AssigneeType.client
      : assignee?.type === 'companies'
        ? AssigneeType.company
        : null
}

export const getUserIdsFromAssigneeType = (assignee: IAssigneeCombined) => {
  return {
    [UserIds.INTERNAL_USER_ID]: assignee?.type === 'internalUsers' ? assignee?.id : null,
    [UserIds.CLIENT_ID]: assignee?.type === 'clients' ? assignee?.id : null,
    [UserIds.COMPANY_ID]: assignee?.type === 'companies' ? assignee?.id : null,
  }
}
