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
