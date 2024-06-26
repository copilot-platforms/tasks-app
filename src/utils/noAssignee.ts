import { IExtraOption } from '@/types/interfaces'

export const NoAssignee = {
  id: null,
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
