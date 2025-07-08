import { IAssigneeCombined, IExtraOption } from '@/types/interfaces'

export const NoAssignee: IAssigneeCombined = {
  id: '01',
  name: 'No assignee',
  avatarImageUrl: '',
  iconImageUrl: '',
  givenName: 'No assignee',
  type: 'internalUsers', //mitigate type error by specifying a type. doesnt do any effect on functionality.
}

export const NoAssigneeExtraOptions: IExtraOption = {
  id: '',
  name: 'No assignee',
  value: '',
  extraOptionFlag: true,
}

export const NoDataFoundOption: IExtraOption = {
  id: 'not_found',
  name: 'Not found',
  value: '',
  extraOptionFlag: true,
} //treating no data found placeholder also as an option.
