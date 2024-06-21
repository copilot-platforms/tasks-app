import { IAssigneeCombined } from '@/types/interfaces'

export const getNameForAvatar = (user: IAssigneeCombined): string => {
  const name = user?.familyName || user?.givenName == 'No assignee' ? '' : user?.familyName || user?.givenName
  return name ?? ''
}
