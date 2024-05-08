import { IAssigneeCombined } from '@/types/interfaces'

export const getAssigneeTypeCorrected = (assignee: IAssigneeCombined) => {
  return assignee?.type === 'internalUsers'
    ? 'internalUser'
    : assignee?.type === 'clients'
      ? 'client'
      : assignee?.type === 'companies'
        ? 'company'
        : ''
}
