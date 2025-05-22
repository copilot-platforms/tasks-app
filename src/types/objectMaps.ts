import { FilterByOptions, FilterOptionsKeywords, IAssigneeCombined, UserIds } from '@/types/interfaces'

export const filterTypeToButtonIndexMap: Record<string, number> = {
  [FilterOptionsKeywords.CLIENTS]: 2,
  [FilterOptionsKeywords.TEAM]: 1,
  '': 3,
}

export const filterOptionsMap: Record<string, FilterByOptions> = {
  [FilterOptionsKeywords.CLIENTS]: FilterByOptions.CLIENT,
  [FilterOptionsKeywords.TEAM]: FilterByOptions.IUS,
  default: FilterByOptions.NOFILTER,
}

export const filterOptionsToAssigneeMap: Record<string, (assignee: IAssigneeCombined[]) => IAssigneeCombined[]> = {
  [FilterOptionsKeywords.CLIENTS]: (assignee) =>
    assignee.filter((el) => el.type == FilterByOptions.CLIENT || el.type == FilterByOptions.COMPANY),
  [FilterOptionsKeywords.TEAM]: (assignee) => assignee.filter((el) => el.type == FilterByOptions.IUS),
  default: (assignee) => assignee,
}

export const userIdFieldMap = {
  internalUsers: UserIds.INTERNAL_USER_ID,
  clients: UserIds.CLIENT_ID,
  companies: UserIds.COMPANY_ID,
} as const
