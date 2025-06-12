import { TruncateMaxNumber } from '@/types/constants'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { IAssigneeCombined, ISelectorOption, IUserIds } from '@/types/interfaces'
import { getAssigneeTypeCorrected } from '@/utils/getAssigneeTypeCorrected'
import { truncateText } from '@/utils/truncateText'
import { AssigneeType } from '@prisma/client'

export const isAssigneeTextMatching = (newInputValue: string, assigneeValue: IAssigneeCombined): boolean => {
  const truncate = (newInputValue: string) => truncateText(newInputValue, TruncateMaxNumber.SELECTOR)
  return (
    truncate(newInputValue) === truncate(`${assigneeValue?.givenName} ${assigneeValue?.familyName}`.trim()) ||
    truncate(newInputValue) === truncate(assigneeValue?.name?.trim() || '')
  )
}

export const getAssigneeId = (userIds?: IUserIds) => {
  return userIds?.internalUserId || userIds?.clientId || userIds?.companyId || undefined
} //usecase : extract the assignee id from the userIds.

export const getUserIds = (task: TaskResponse): IUserIds => {
  return {
    internalUserId: task.internalUserId || null,
    clientId: task.clientId || null,
    companyId: task.companyId || null,
  }
} //util to get userIds ({internalUserId, clientId, companyId}) from a task object

export const parseAssigneeToSelectorOptions = (assignee: IAssigneeCombined): ISelectorOption[] => {
  return [
    {
      value: assignee.id,
      label: getAssigneeName(assignee),
      avatarSrc: assignee.avatarImageUrl,
      avatarFallbackColor: assignee.fallbackColor,
      companyId: assignee.companyId,
      type: getAssigneeTypeCorrected(assignee) ?? AssigneeType.internalUser, //change this when UserCompanySelector supports noAssignee.
    },
  ]
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
