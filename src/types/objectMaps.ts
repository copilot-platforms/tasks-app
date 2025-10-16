import { FilterByOptions, FilterOptionsKeywords, IAssigneeCombined, UserIds } from '@/types/interfaces'

export const filterTypeToButtonIndexMap: Record<string, number> = {
  [FilterOptionsKeywords.CLIENTS]: 2,
  [FilterOptionsKeywords.TEAM]: 1,
  '': 3,
}

export const clientFilterTypeToButtonIndexMap: Record<string, number> = {
  [FilterOptionsKeywords.CLIENT_WITH_VIEWERS]: 0,
  [FilterOptionsKeywords.CLIENTS]: 1,
}

export const previewFilterTypeToButtonIndexMap: Record<string, number> = {
  [FilterOptionsKeywords.CLIENTS]: 2,
  [FilterOptionsKeywords.TEAM]: 1,
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
  internalUser: UserIds.INTERNAL_USER_ID,
  client: UserIds.CLIENT_ID,
  company: UserIds.COMPANY_ID,
} as const
