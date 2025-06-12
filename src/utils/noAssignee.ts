import { IAssigneeCombined, IExtraOption } from '@/types/interfaces'

export const NoAssignee = {
  id: '01',
  name: 'No assignee',
  avatarImageUrl: '',
  iconImageUrl: '',
  givenName: 'No assignee',
  type: '',
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
