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
