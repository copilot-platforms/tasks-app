import { TruncateMaxNumber } from '@/types/constants'
import { IAssigneeCombined } from '@/types/interfaces'
import { truncateText } from '@/utils/truncateText'

export const isAssigneeTextMatching = (newInputValue: string, assigneeValue: IAssigneeCombined): boolean => {
  const truncate = (newInputValue: string) => truncateText(newInputValue, TruncateMaxNumber.SELECTOR)
  return (
    truncate(newInputValue) === truncate(`${assigneeValue?.givenName} ${assigneeValue?.familyName}`.trim()) ||
    truncate(newInputValue) === truncate(assigneeValue?.name?.trim() || '')
  )
}

interface Assignable {
  name?: string
  givenName?: string
  familyName?: string
}
export const getAssigneeName = (assigneeValue: Assignable | undefined, noAssigneetext: string = 'No assignee'): string => {
  return assigneeValue
    ? assigneeValue?.name || `${assigneeValue?.givenName ?? ''} ${assigneeValue?.familyName ?? ''}`.trim()
    : noAssigneetext
}

export const checkAssignee = (assigneeValue: IAssigneeCombined | undefined): boolean => {
  return !!assigneeValue
}
