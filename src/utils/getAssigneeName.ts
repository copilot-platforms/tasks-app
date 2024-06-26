import { IAssigneeCombined } from '@/types/interfaces'

export const getAssigneeName = (user: IAssigneeCombined): string => {
  const name = user?.givenName == 'No assignee' ? '' : user?.givenName
  return name ?? ''
}
