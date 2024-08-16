import { IAssigneeCombined } from '@/types/interfaces'
import { truncateText } from './truncateText'
import { TruncateMaxNumber } from '@/types/constants'

export const isAssigneeTextMatching = (newInputValue: string, assigneeValue: IAssigneeCombined): boolean => {
  const truncate = (newInputValue: string) => truncateText(newInputValue, TruncateMaxNumber.SELECTOR)
  return (
    truncate(newInputValue) === truncate(`${assigneeValue?.givenName} ${assigneeValue?.familyName}`.trim()) ||
    truncate(newInputValue) === truncate(assigneeValue?.name?.trim() || '')
  )
}

export const getAssigneeName = (
  assigneeValue: IAssigneeCombined | undefined,
  noAssigneetext: string = 'No assignee',
): string => {
  return assigneeValue
    ? assigneeValue?.name || `${assigneeValue?.givenName ?? ''} ${assigneeValue?.familyName ?? ''}`.trim()
    : noAssigneetext
}

export const checkAssignee = (assigneeValue: IAssigneeCombined | undefined): boolean => {
  return !!assigneeValue
}
