import { InternalUsersSchema } from '@/types/common'
import { IAssigneeCombined } from '@/types/interfaces'
import { getAssigneeTypeCorrected } from '@/utils/getAssigneeTypeCorrected'
import { AssigneeType } from '@prisma/client'
import { z } from 'zod'

export const ShouldConfirmBeforeReassignment = (previousAssignee: IAssigneeCombined, currentAssignee: IAssigneeCombined) => {
  const currentAssigneeType = getAssigneeTypeCorrected(currentAssignee)
  const previousAssigneeCompanyAccessList = getPreviousCompanyList(previousAssignee)
  const previousAssigneeType = getAssigneeTypeCorrected(previousAssignee)
  if (!previousAssigneeCompanyAccessList.length && previousAssigneeType == AssigneeType.internalUser) {
    return false
  } // case when previous assignee is an IU with full access to clients.

  switch (currentAssigneeType) {
    case AssigneeType.internalUser:
      return false // add logic to return true/false for confirming before reassignment for IUs here

    case AssigneeType.client:
      return !previousAssigneeCompanyAccessList.includes(z.string().parse(currentAssignee.companyId))

    case AssigneeType.company:
      return !previousAssigneeCompanyAccessList.includes(currentAssignee.id)

    default:
      return false
  }
}

const getPreviousCompanyList = (previousAssignee: IAssigneeCombined) => {
  const previousCompanyList: string[] = []
  const previousAssigneeType = getAssigneeTypeCorrected(previousAssignee)

  switch (previousAssigneeType) {
    case AssigneeType.internalUser:
      const previousIU = InternalUsersSchema.parse(previousAssignee)
      if (previousIU.isClientAccessLimited) {
        previousCompanyList.push(...(previousIU?.companyAccessList || []))
        return previousCompanyList
      }

    case AssigneeType.client:
      if (previousAssignee.companyId) {
        previousCompanyList.push(previousAssignee.companyId)
      }
      return previousCompanyList

    case AssigneeType.company:
      previousCompanyList.push(previousAssignee.id)
      return previousCompanyList

    default:
      return previousCompanyList
  }
}
