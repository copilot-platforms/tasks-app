import { TruncateMaxNumber } from '@/types/constants'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { IAssigneeCombined, IUserIds } from '@/types/interfaces'
import { truncateText } from '@/utils/truncateText'

export const isAssigneeTextMatching = (newInputValue: string, assigneeValue: IAssigneeCombined): boolean => {
  const truncate = (newInputValue: string) => truncateText(newInputValue, TruncateMaxNumber.SELECTOR)
  return (
    truncate(newInputValue) === truncate(`${assigneeValue?.givenName} ${assigneeValue?.familyName}`.trim()) ||
    truncate(newInputValue) === truncate(assigneeValue?.name?.trim() || '')
  )
}

export const getAssigneeId = (userIds?: IUserIds) => {
  if (!userIds) {
    return undefined
  }
  if (userIds.internalUserId) {
    return userIds.internalUserId
  } else if (userIds.clientId) {
    return userIds.clientId
  } else if (userIds.companyId) {
    return userIds.companyId
  }
  return undefined
} //usecase : extract the assignee id from the userIds.

export const getUserIds = (task: TaskResponse): IUserIds => {
  return {
    internalUserId: task.internalUserId || null,
    clientId: task.clientId || null,
    companyId: task.companyId || null,
  }
} //util to get userIds ({internalUserId, clientId, companyId}) from a task object

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
